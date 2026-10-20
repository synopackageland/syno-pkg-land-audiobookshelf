# Validation scope

Candidate: upstream v2.37.1, SPK 2.37.1-0001, x86_64. Device: DSM 7.3.2 with
Container Manager. No reboot, daemon/CA changes or account creation/deletion.
Raw device evidence, account files, browser profiles and screenshots are private.

## Build

The official GHCR artifact passed the affected version tests (5/5), render
freshness, CLI check, release build and inspect. `build-proof.json` records its
hash and the exact development SDK/CLI revisions. Pins are unchanged; the
source-override artifact is **not publishable**. Upstream files are unchanged.
Earlier real-image runtime tests cover API bootstrap, restart, read-only/nonroot
execution, frontend assets, native OIDC start and refusal of a symlinked key.

Direct GHCR metadata access returned 403; a digest-verifying HTTPS mirror was used
for build metadata. The final artifact still references official GHCR. Native
installation of that artifact failed at image download with `COMPOSE_IMAGE_DENIED`.
No successful installation of the final official-registry SPK is claimed.

## Device diagnostic

Device cases use a separately built and inspected diagnostic SPK whose sole
runtime image-source difference is the mirror repository. Its platform digest
`sha256:10f3490855630aa024ba618b90ba6f58f3d9d7063dd77e1d1e958fdc4ede7c70`
and actual image config digest
`sha256:da452ea368f8bc126ef998175f726f9be995954ccdd38fccb063e0e460b1912d`
match the official image lock. These results certify the measured diagnostic
behavior, not official-registry reachability or trusted first-open HTTPS.

Browser tests use upstream e2e 0.19.0 with shared DSM login profiles, DSM HTTP
inside an authorized SSH tunnel, forwarded native HTTPS callbacks and explicit
certificate-error tolerance limited to the disposable test browser.

| Scenario | Measured result |
| --- | --- |
| Native install-selected Share | One owned synthetic-audio Share selected through native install values; saved name resolves to the worker mount. |
| Package account authority | Kernel read denied before the direct package-user RO grant; after grant both track hashes match. In-container write returns EROFS. |
| Runtime | Fixed nonroot UID:GID, cap_drop ALL, no-new-privileges, read-only rootfs. Upstream and OIDC issuer listen only on IPv4 loopback; setup listener is closed after handoff. |
| DSM main menu → upstream | Native OIDC administrator, linked subject, no App password; reopen retains the same account. |
| Native logout/reopen | Native logout returns 200; desktop reopen uses OIDC with the same account and no password prompt. |
| UI media library and playback | Library created at `/media/audiobooks`; native stream returns 206 with nonzero bytes and advancing audio. |
| Unauthorized ordinary user | Actual browser authorization return is 403 with stable `dsm_admin_required`; this candidate admits administrators only. |
| Native stop/start | Both actions succeed; account/library/item IDs, selection, media and private credential hashes unchanged; browser playback passes afterward. |
| Upgrade 0001 → 0002 | Native installation succeeds without selection override; version read back, state unchanged, browser playback passes. |
| Uninstall keep/reinstall | Native uninstall then same-version reinstall succeeds; account/library/item IDs, selected path and media/private-credential hashes unchanged; browser playback passes. |
| Native delete-data choice | Real checkbox selected and checked state read back; wizard names the retained volume and completion reports COMPOSE_DATA_RETAINED. Package/container/project removed, but named-volume credential and source-audio hashes unchanged; DSM bases are empty and package identity retained. |
| Owned-resource cleanup | Test operator explicitly removes the owned retained volume, synthetic Share and temporary resources after recording retention; independent readback verifies absence. Empty DSM bases and package account/group are intentionally retained. |

The complete identity/media browser run passed 7/7 including two account setups.
Focused playback runs after stop/start, upgrade and keep/reinstall each passed
2/2 including setup. Native delete-data UI also passed 2/2 including setup.

## Remaining product limits

Ordinary authorized-user admission needs generic DSM Application Privileges
support. Account deletion/session revocation needs a native bridge adapter and
its retention policy. Named container volumes are retained by the SDK even when
delete-data is selected. See [framework-gaps.md](framework-gaps.md).

Release the generic Shared Folder changes, update dependency pins deliberately,
then rerun the unmodified final SPK's native install and lifecycle on a device
that can reach its official registry before publishing.
