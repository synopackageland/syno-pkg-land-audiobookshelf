# Minimal app-open smoke

Run `npm run e2e:smoke` from `synology/` against an authorized NAS through the
operator-owned tunnel. The CLI's `appOpenSmoke` opens the manifest entry for A
(administrator), N (a real non-admin account receiving the SDK access-denied
page), and X (a fresh signed-out context). The ready marker is the upstream
Appbar account link, rendered after native authentication. All three cases must pass; a missing N account is a skip,
not acceptance.

Set `DSM_E2E_URL`, `DSM_E2E_TARGET`, `DSM_E2E_ACCOUNT_ADMIN`,
`DSM_E2E_ACCOUNT_NORMAL`, `DSM_E2E_PROFILE_DIR`, and `DSM_E2E_OUTPUT_DIR`.
Account JSON files must be mode 600 and outside `synology/`; profiles stay
private. Use an output directory under ignored `synology/.e2e/` and archive
privately after the run. The App remains administrator-only; do not grant the
normal account administrator privileges or widen the entry for smoke.
If the browser does not trust the DSM certificate, open an
operator-owned SSH tunnel from the Linux test host: a free loopback port to the
NAS's port 5000. Set `DSM_E2E_URL=http://127.0.0.1:<port>/` and close that tunnel
after the run. Keep the smoke test and CLI helper unchanged. Forward the selected
gateway and native DSM callback ports as needed for browser routing. No router
forwarding is required. A/N certificate handling belongs to the released CLI
helper; never add App-side TLS bypasses to make smoke pass.

The existing extended suite remains available through `npm run e2e:nas`.
Its `ordinary` profile tests the same administrator-only denial boundary as
the smoke's `normal` profile.

# Extended device acceptance

Run upstream `e2e` 0.19.0 / `@e2e-dev/web` 0.14.0 in an authorized Linux browser
container. The suite uses the released CLI's shared DSM login/profile helpers,
one worker and private account JSON files. No model calls are needed for its
deterministic scenarios. Credentials, profiles and evidence stay outside Git.

Set `DSM_E2E_URL`, `DSM_E2E_TARGET`, `DSM_E2E_ACCOUNT_ADMIN`,
`DSM_E2E_ACCOUNT_ORDINARY`, `DSM_E2E_PROFILE_DIR`, and `DSM_E2E_OUTPUT_DIR`.
The output path must be under the ignored `synology/.e2e/` directory; archive it
privately afterward. Open caller-owned forwards for DSM's native callback ports
and gateway 30443; never cancel another operator's forward.

Set `ABS_E2E_TRUST_GATEWAY=1` only for explicit certificate-error tolerance in
this disposable test browser. This does not modify DSM, add system trust or prove
trusted first-open HTTPS. The initial recorded runner uses DSM HTTP inside an
authorized SSH tunnel, with gateway HTTPS and the native DSM HTTPS callback also
forwarded. Preserve that transport scope in any acceptance statement.

The administrator cases click the real DSM main-menu item, wait for the native
upstream OIDC user, check an administrator with an OpenID link and no password
prompt, reopen it and exercise native logout. The ordinary-user case checks a
real signed-in DSM account without App permission is denied. These are independent of Linux image probes.

For the authorized disposable media fixture, create a uniquely named DSM Shared
Folder containing `audiobooks/Proof Author/Proof Book/{01,02}.mp3` synthetic audio.
Select it during native installation, grant the package account read-only access,
and independently prove read denial before the grant, read success after it and
container write refusal. Use `ABS_E2E_MEDIA_PATH=/media/audiobooks` (the default).
Run with `ABS_E2E_CREATE_LIBRARY=1` to create `Proof Audio` through the upstream UI
and play it. The test requires an actual nonempty HTTP 200/206 audio response and
an advancing audio element. The read-only API calls locate the created library;
they do not create it or replace the playback UI action.

After each native stop/start, 0001-to-0002 upgrade or uninstall-keep/reinstall,
set `ABS_E2E_RETAINED=1` and select the retained-media case. Independently compare
upstream account/library IDs, private credential hash and synthetic audio hashes.
Only explicit operator actions may perform native package lifecycle changes.

Run `ABS_E2E_REMOVE_DATA=1` only after the other acceptance cases. The final test
opens the owned Package Center card and selects the real delete-data checkbox.
It records the SDK's retained-volume warning. Independently read back package,
project, container, network and volume state; a checkbox or success dialog does
not prove data deletion. Record retained data as a failed deletion requirement,
then separately clean the explicitly owned test fixture and verify removal.
