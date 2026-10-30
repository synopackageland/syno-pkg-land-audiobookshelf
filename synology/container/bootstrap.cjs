// Configure the unmodified upstream through its native HTTP API before serving.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const {once} = require('node:events');
const {randomBytes} = require('node:crypto');
const directory = '/var/tmp/audiobookshelf';
const keyFile = path.join(directory, 'bootstrap-api-key');
const base = 'http://127.0.0.1:13379';
const issuerPort = Number(process.env.ABS_OIDC_PORT);
const issuer = `http://127.0.0.1:${issuerPort}`;
const budget = Number(process.env.SYNOPKGLAND_STARTUP_BUDGET_SECONDS);
const deadline = performance.now() + budget * 1000;
let child, stopping = false, phase = 'runtime-check';
function remaining() {
  if (!Number.isInteger(budget) || budget < 2 || budget > 900 || performance.now() >= deadline)
    throw new Error('startup-budget');
  return Math.max(1, Math.floor(deadline - performance.now()));
}
function readKey() {
  let fd;
  try { fd = fs.openSync(keyFile, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  try {
    const st = fs.fstatSync(fd);
    if (!st.isFile() || st.uid !== process.getuid() || st.nlink !== 1 || (st.mode & 0o777) !== 0o600 || st.size > 4096)
      throw new Error('private-key-state');
    const value = fs.readFileSync(fd, 'utf8');
    if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) throw new Error('private-key-content');
    return value;
  } finally { fs.closeSync(fd); }
}
function saveKey(value) {
  const temp = keyFile + '.' + randomBytes(8).toString('hex');
  const fd = fs.openSync(temp, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
  try { fs.writeFileSync(fd, value); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  try { fs.linkSync(temp, keyFile); } finally { fs.unlinkSync(temp); }
  const dir = fs.openSync(directory, fs.constants.O_RDONLY | fs.constants.O_DIRECTORY);
  try { fs.fsyncSync(dir); } finally { fs.closeSync(dir); }
}
async function api(route, {method = 'GET', body, token} = {}) {
  const response = await fetch(base + route, {
    method, redirect: 'error', signal: AbortSignal.timeout(Math.min(5000, remaining())),
    headers: {'Content-Type': 'application/json', ...(token ? {Authorization: 'Bearer ' + token} : {})},
    ...(body === undefined ? {} : {body: JSON.stringify(body)}),
  });
  if (!response.ok) throw new Error('native-api');
  const text = await response.text();
  try { return JSON.parse(text); } catch { return null; }
}
function launch(port) {
  child = spawn(process.execPath, ['dist-server/index.js'], {
    cwd: '/app', env: {...process.env, HOST: '127.0.0.1', PORT: String(port)},
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  child.on('error', () => { process.exitCode = 1; });
  return child;
}
async function stop() {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const active = child, exited = once(active, 'exit');
  active.kill('SIGTERM');
  const timer = setTimeout(() => active.kill('SIGKILL'), 20000);
  try { await exited; } finally { clearTimeout(timer); }
}
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => {
  stopping = true;
  stop().finally(() => process.exit(0));
});
async function main() {
  remaining();
  if (!Number.isInteger(issuerPort) || issuerPort < 1024 || issuerPort > 65535 || process.getuid() === 0 || !/^[a-f0-9]{64}$/.test(process.env.ABS_OIDC_SECRET || '') ||
      !/^[a-f0-9]{64}$/.test(process.env.ABS_BOOTSTRAP_PASSWORD || '')) throw new Error('runtime-identity-or-secret');
  let token = readKey();
  const privateChild = launch(13379);
  let status;
  while (!status) {
    remaining();
    if (privateChild.exitCode !== null || privateChild.signalCode !== null) throw new Error('upstream-exited');
    try { status = await api('/status'); }
    catch { await new Promise(resolve => setTimeout(resolve, Math.min(250, remaining()))); }
  }
  if (!status.isInit) {
    phase = 'initialize';
    if (token) throw new Error('private-key-without-database');
    await api('/init', {method: 'POST', body: {newRoot: {username: 'dsm-package-bootstrap', password: process.env.ABS_BOOTSTRAP_PASSWORD}}});
  }
  if (!token) {
    phase = 'bootstrap-key';
    const login = await api('/login', {method: 'POST', body: {username: 'dsm-package-bootstrap', password: process.env.ABS_BOOTSTRAP_PASSWORD}});
    const access = login?.user?.accessToken;
    if (!access || login.user.type !== 'root') throw new Error('bootstrap-login');
    const key = await api('/api/api-keys', {method: 'POST', token: access,
      body: {name: 'DSM package bootstrap', userId: login.user.id, isActive: true}});
    if (!key?.apiKey?.apiKey) throw new Error('bootstrap-key');
    saveKey(key.apiKey.apiKey);
    token = readKey();
  }
  const desired = {
    authActiveAuthMethods: ['openid'],
    authOpenIDIssuerURL: issuer,
    authOpenIDAuthorizationURL: issuer + '/authorize',
    authOpenIDTokenURL: issuer + '/token',
    authOpenIDUserInfoURL: issuer + '/userinfo',
    authOpenIDJwksURL: issuer + '/jwks',
    authOpenIDLogoutURL: null,
    authOpenIDClientID: 'audiobookshelf',
    authOpenIDClientSecret: process.env.ABS_OIDC_SECRET,
    authOpenIDTokenSigningAlgorithm: 'RS256',
    authOpenIDAutoLaunch: true,
    authOpenIDAutoRegister: true,
    authOpenIDMatchExistingBy: null,
    authOpenIDGroupClaim: 'groups',
    authOpenIDAdvancedPermsClaim: '',
    authOpenIDSubfolderForRedirectURLs: '/audiobookshelf',
  };
  phase = 'configure-oidc';
  await api('/api/auth-settings', {method: 'PATCH', token, body: desired});
  const actual = await api('/api/auth-settings', {token});
  for (const [key, value] of Object.entries(desired)) {
    phase = 'readback-' + key;
    if (JSON.stringify(actual[key]) !== JSON.stringify(value)) throw new Error('native-policy-readback');
  }
  token = null;
  phase = 'handoff';
  await stop();
  if (stopping) return;
  remaining();
  const serving = launch(13378);
  const [code, signal] = await once(serving, 'exit');
  if (!stopping) process.exitCode = signal || code ? 1 : 0;
}
main().catch(async () => {
  // Native API errors may contain credentials; emit only a fixed diagnostic.
  console.error('Audiobookshelf bootstrap failed at ' + phase + '; serving port remains closed. Check private state and compatibility.');
  await stop();
  process.exitCode = 1;
});
