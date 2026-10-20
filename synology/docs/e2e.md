# Device acceptance

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
real signed-in DSM account's denial. These are independent of Linux image probes.

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
