import {test} from '@e2e-dev/web';
import {expect} from 'e2e';
import {dsmPage, dsmSessionLive, handleDialogs, registerDsmSecrets} from '@synopackageland/cli/e2e';
import {desktop} from './desktop.ts';
import {join} from 'node:path';
import {writeFile} from 'node:fs/promises';

test.beforeEach(async ({browser}) => {await handleDialogs(browser);});
async function openApp(app: any) {
  if (process.env.ABS_E2E_TRUST_GATEWAY !== '1') throw new Error('Explicit test-only gateway trust is required');
  await desktop(app);
  const page = dsmPage();
  await page.bringToFront();
  await registerDsmSecrets(page);
  expect(await dsmSessionLive(page)).toBe(true);
  await (await page.context().browser().newBrowserCDPSession()).send('Security.setIgnoreCertificateErrors', {ignore: true});
  await page.locator('#sds-taskbar button.start-button-img').click();
  const [reader] = await Promise.all([
    page.context().waitForEvent('page', {timeout: 30000}),
    page.getByRole('menuitem', {name: 'Audiobookshelf', exact: true}).click(),
  ]);
  reader.proofResponses = [];
  reader.on('response', (response: any) => {
    if (reader.proofResponses.length < 256) reader.proofResponses.push({
      path: new URL(response.url()).pathname, method: response.request().method(), status: response.status(),
    });
  });
  await registerDsmSecrets(reader);
  reader.setDefaultTimeout(30000);
  reader.setDefaultNavigationTimeout(45000);
  await (await reader.context().newCDPSession(reader)).send('Security.setIgnoreCertificateErrors', {ignore: true});
  await reader.waitForLoadState('domcontentloaded');
  return reader;
}
async function capture(reader: any, name: string) {
  await reader.screenshot({path: join(process.env.DSM_E2E_OUTPUT_DIR!, name + '.png')}).catch(() => {});
  await writeFile(join(process.env.DSM_E2E_OUTPUT_DIR!, name + '.txt'), await reader.locator('body').innerText(), {mode: 0o600});
  await writeFile(join(process.env.DSM_E2E_OUTPUT_DIR!, name + '-responses.json'), JSON.stringify(reader.proofResponses), {mode: 0o600});
}
async function identity(reader: any) {
  await reader.bringToFront();
  try {
    await reader.waitForFunction(() => !!(window as any).$nuxt?.$store?.state?.user?.user, undefined, {timeout: 90000});
  } catch (error) {
    await reader.screenshot({path: join(process.env.DSM_E2E_OUTPUT_DIR!, 'upstream-login-failure.png')});
    await writeFile(join(process.env.DSM_E2E_OUTPUT_DIR!, 'upstream-login-failure.txt'), await reader.locator('body').innerText(), {mode: 0o600});
    throw error;
  }
  return reader.evaluate(() => {
    const user = (window as any).$nuxt.$store.state.user.user;
    return {id: user.id, type: user.type, hasSubject: !!user.hasOpenIDLink};
  });
}
async function media(reader: any, create: boolean) {
  await identity(reader);
  if (create) {
    await reader.getByRole('button', {name: 'System Settings', exact: true}).click();
    await reader.locator('a[href^="/audiobookshelf/config/libraries"]').first().click();
    await reader.getByRole('button', {name: 'Add Library', exact: true}).click();
    await reader.getByLabel('Library Name', {exact: true}).fill('Proof Audio');
    await reader.getByPlaceholder('New folder path', {exact: true}).fill(process.env.ABS_E2E_MEDIA_PATH || '/media/audiobooks');
    await reader.getByLabel('Library Name', {exact: true}).click();
    const created = reader.waitForResponse(response => new URL(response.url()).pathname.endsWith('/api/libraries') && response.request().method() === 'POST');
    await reader.getByRole('button', {name: 'Create', exact: true}).click();
    expect((await created).status()).toBe(200);
  }
  const contents = await reader.evaluate(async () => {
    const token = (window as any).$nuxt.$store.state.user.accessToken;
    const headers = {Authorization: 'Bearer ' + token};
    const reply = await (await fetch('/api/libraries', {headers})).json();
    const library = reply.libraries.find((item: any) => item.name === 'Proof Audio');
    if (!library) return null;
    const books = await (await fetch('/api/libraries/' + library.id + '/items', {headers})).json();
    return {libraryId: library.id, itemId: books.results?.[0]?.id};
  });
  expect(contents?.libraryId).toBeTruthy();
  if (!contents.itemId) {
    if (!new URL(reader.url()).pathname.includes('/config/libraries')) {
      await reader.getByRole('button', {name: 'System Settings', exact: true}).click();
      await reader.locator('a[href^="/audiobookshelf/config/libraries"]').first().click();
    }
    const scanButton = reader.getByRole('button', {name: 'Scan', exact: true});
    await scanButton.focus();
    const [scan] = await Promise.all([
      reader.waitForResponse(response => new URL(response.url()).pathname.includes('/api/libraries/' + contents.libraryId + '/scan') && response.request().method() === 'POST'),
      scanButton.press('Enter'),
    ]);
    expect(scan.status()).toBe(200);
  }
  // Native scan is asynchronous; watch its real library UI for completion.
  await reader.locator('#appbar a').first().click();
  await reader.getByText('Proof Book', {exact: true}).filter({visible: true}).first().waitFor({timeout: 90000});
  await reader.locator('[id^=book-card-]').filter({has: reader.getByText('Proof Book', {exact: true})}).first().click({position: {x: 40, y: 5}});
  const stream = reader.waitForResponse(response => /\/(?:api\/items\/.*\/file\/|public\/session\/[^/]+\/track\/)/.test(new URL(response.url()).pathname) && [200, 206].includes(response.status()), {timeout: 45000});
  await reader.getByRole('button', {name: /^Play$/}).first().click();
  const audio = await stream;
  expect(Number(audio.headers()['content-length'] || 0)).toBeGreaterThan(0);
  await reader.waitForFunction(() => Array.from(document.querySelectorAll('audio')).some(element => !element.paused && element.currentTime > 1), undefined, {timeout: 30000});
  await reader.screenshot({path: join(process.env.DSM_E2E_OUTPUT_DIR!, 'audio-playing.png')});
  await writeFile(join(process.env.DSM_E2E_OUTPUT_DIR!, 'media.json'), JSON.stringify({
    libraryId: contents.libraryId, httpStatus: audio.status(), streamedBytes: Number(audio.headers()['content-length']),
    playbackAdvanced: true, source: 'install-selected read-only Shared Folder',
  }) + '\n', {mode: 0o600});
}
test('DSM main menu automatically signs in an OIDC administrator without an App password',
  {session: 'admin', timeout: 180000}, async ({app}) => {
    const reader = await openApp(app);
    try {
      const user = await identity(reader);
      expect(user.type).toBe('admin');
      expect(user.hasSubject).toBe(true);
      expect(await reader.locator('input[type=password]:visible').count()).toBe(0);
      await reader.screenshot({path: join(process.env.DSM_E2E_OUTPUT_DIR!, 'oidc-admin.png')});
      await writeFile(join(process.env.DSM_E2E_OUTPUT_DIR!, 'oidc-admin.json'), JSON.stringify(user) + '\n', {mode: 0o600});
    } finally {await reader.close();}
  });
test('reopening the desktop App retains the same upstream account',
  {session: 'admin', timeout: 180000}, async ({app}) => {
    const first = await openApp(app);
    const before = await identity(first);
    await first.close();
    const second = await openApp(app);
    try {expect((await identity(second)).id).toBe(before.id);}
    finally {await second.close();}
  });
test('native logout and desktop reopen use OIDC without a second password',
  {session: 'admin', timeout: 180000}, async ({app}) => {
    const reader = await openApp(app);
    const before = await identity(reader);
    try {
      await reader.locator('#appbar a[href^="/audiobookshelf/account"]').focus();
      await reader.locator('#appbar a[href^="/audiobookshelf/account"]').press('Enter');
      const button = reader.getByRole('button', {name: /Logout/}).last();
      await button.focus();
      const [loggedOut] = await Promise.all([
        reader.waitForResponse(response => /\/logout\/?$/.test(new URL(response.url()).pathname) && response.request().method() === 'POST', {timeout: 15000}),
        button.press('Enter'),
      ]);
      expect(loggedOut.status()).toBe(200);
    } catch (error) {await capture(reader, 'logout-failure'); throw error;}
    finally {await reader.close();}
    const reopened = await openApp(app);
    try {
      expect((await identity(reopened)).id).toBe(before.id);
      expect(await reopened.locator('input[type=password]:visible').count()).toBe(0);
    } finally {await reopened.close();}
  });
test('add an install-selected media library and play a synthetic audiobook',
  {session: 'admin', timeout: 240000}, async ({app}) => {
    if (process.env.ABS_E2E_CREATE_LIBRARY !== '1') {test.skip('Requires the owned audio fixture'); return;}
    const reader = await openApp(app);
    try {await media(reader, true);} finally {await reader.close();}
  });
test('retained media plays after a native lifecycle operation',
  {session: 'admin', timeout: 240000}, async ({app}) => {
    if (process.env.ABS_E2E_RETAINED !== '1') {test.skip('Run after the explicit native lifecycle operation'); return;}
    const reader = await openApp(app);
    try {await media(reader, false);} catch (error) {await capture(reader, 'media-failure'); throw error;}
    finally {await reader.close();}
  });
test('an unauthorized ordinary DSM user receives HTTP 403',
  {session: 'nonadmin', timeout: 180000}, async ({app}) => {
    await desktop(app, 'ordinary');
    const page = dsmPage();
    await registerDsmSecrets(page);
    const url = new URL(page.url()); url.protocol = 'https:'; url.port = '30443'; url.pathname = '/'; url.search = '';
    await (await page.context().newCDPSession(page)).send('Security.setIgnoreCertificateErrors', {ignore: true});
    const reader = await page.context().newPage();
    reader.proofResponses = [];
    reader.on('response', (response: any) => reader.proofResponses.push({path: new URL(response.url()).pathname, status: response.status()}));
    await registerDsmSecrets(reader);
    await (await page.context().browser().newBrowserCDPSession()).send('Security.setIgnoreCertificateErrors', {ignore: true});
    try {
      // A native authorization hop is needed before a DSM role can be checked.
      const denied = reader.waitForResponse(response => new URL(response.url()).pathname === '/_sso/dsm-return' && response.status() === 403);
      await reader.goto(url.href, {waitUntil: 'domcontentloaded'});
      const response = await denied;
      await reader.locator('[data-error-code=dsm_app_privilege_denied]').waitFor();
      await reader.screenshot({path: join(process.env.DSM_E2E_OUTPUT_DIR!, 'ordinary-user-denied.png')});
      expect(response.status()).toBe(403);
      await writeFile(join(process.env.DSM_E2E_OUTPUT_DIR!, 'ordinary-denied.json'), JSON.stringify({httpStatus: response.status(), code: 'dsm_app_privilege_denied'}) + '\n', {mode: 0o600});
    } catch (error) {await capture(reader, 'ordinary-denial-failure'); throw error;}
    finally {await reader.close();}
  });
