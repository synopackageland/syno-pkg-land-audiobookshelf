# Validation scope

## 2.37.1-0005 SDK 0.28.0 rebuild

Rebuilt with published CLI/templates/SDK/App 0.28.0, executor/v0.27.0, UI 0.14.4
and go1.26.10, without source overrides. On macOS (offline, no NAS), `npm ci`,
`npm test` (5/5), `render-compose.py --check`, `synopkgland check --json`
(ok), `synopkgland build --arch x86_64 --json` (ok) and
`synopkgland inspect --json` (ok, `findings=[]`) passed. The x86_64 SPK SHA-256 is
recorded in `security-rebuild.json`. No NAS or device test was run; the SDK's
slow-NAS startup defaults are not device-verified.

## Released dependency refresh

CLI/templates/SDK/App 0.20.0, executor/v0.20.0 and UI 0.12.5 were used without
source overrides. npm lock integrity matches the public registry. The unchanged
x86_64 initial SPK version passes affected tests, check, build and inspect with
`findings=[]`. The official image and adapter behavior are unchanged.

Fresh installation on DSM 7.3.2 selected an owned synthetic-media share with
read-only package-account ACL. Native start succeeded. DSM main-menu sign-in,
media read/playback and native stop/start passed. Native uninstall was followed
by independent readback: package, containers, project, test-only volumes and
share were absent. DSM-retained package identities were left in place.

The device's native registry preflight reported `COMPOSE_IMAGE_DENIED`, while
installation/start completed successfully using the pinned cached image. This
is not a clean image-pull test. No daemon, mirror, CA or DSM settings changed.
Browser acceptance used certificate-error tolerance only in its disposable test
browser. Other lifecycle and identity boundaries below retain their earlier
bounded evidence; no reboot or broader certification was repeated.

Candidate: upstream v2.37.1, SPK 2.37.1-0001, x86_64. Device: DSM 7.3.2 with
Container Manager. No reboot, daemon/CA changes or DSM account creation/deletion.
Raw device evidence, account files, browser profiles and screenshots are private.

## Official Docker Hub artifact

The image reference is `docker.io/advplyr/audiobookshelf:2.37.1` pinned to index
`sha256:581d68b2a6fc7ebf58d81c878a9f387cbbc0d88ac9d37b298b9cee10168af85b`.
Direct queries of both official upstream registries returned this exact index,
matching amd64/arm64 platform manifests, image configurations and source revision.
The earlier diagnostic therefore used the same immutable upstream image bytes.

The Docker Hub artifact passed the affected version tests (5/5), render freshness,
CLI check, release build and inspect. The release is rebuilt with published
CLI/templates/SDK/App 0.20.0, UI 0.12.5 and executor/v0.20.0.
`build-proof.json` records the release artifact SHA-256 and checks.
All upstream files remain unchanged. The earlier device evidence below used the
reviewed development implementation of these capabilities; the release dependency
refresh is verified separately before publication.


The builder used a digest-verifying HTTPS metadata transport mirror after its
direct registry TLS handshake timed out. The SPK keeps the official Docker Hub
runtime reference. DSM uses its existing Docker Hub mirror/CA configuration;
neither its settings nor the SPK reference is modified for device acceptance.

## Current official-artifact acceptance

Only the requested path is repeated on the unmodified Docker Hub SPK:
native installation with an existing Shared Folder selection, DSM main-menu OIDC,
one UI-created media library and real playback, then native uninstall and owned
fixture cleanup with independent readback. Other lifecycle results below are
retained evidence from the earlier identical-image diagnostic.

Browser tests use upstream e2e 0.19.0 with shared DSM login profiles, DSM HTTP
inside an authorized SSH tunnel, forwarded native HTTPS callbacks and explicit
certificate-error tolerance limited to the disposable test browser. Trusted
first-open HTTPS and native/mobile clients are not certified.

The official-artifact OIDC/media run passed **3/3** including administrator setup:
native installation selected the existing Share, the running image configuration
matched the lock, DSM main-menu entry produced a linked OIDC administrator with no
App password, and the UI created `/media/audiobooks`. Native audio returned
**HTTP 206 with 64,663 bytes** and the audio element advanced. Package-account
source reads matched fixture hashes; a container write returned `EROFS`.

The native Package Center uninstall run passed **2/2** including setup. It
selected delete-data, disclosed the exact retained volume and completed with
`COMPOSE_DATA_RETAINED`. Independent readback verified package/container/project
removal. The operator then removed only the owned retained volume, synthetic
Share and temporary resources; final absence checks passed. DSM package account,
group and empty package base directories were intentionally retained.

## Earlier identical-image diagnostic lifecycle evidence

The platform manifest is
`sha256:10f3490855630aa024ba618b90ba6f58f3d9d7063dd77e1d1e958fdc4ede7c70`
and its running image configuration is
`sha256:da452ea368f8bc126ef998175f726f9be995954ccdd38fccb063e0e460b1912d`.
These exact digests match the final Docker Hub artifact. No broader lifecycle
rerun on the new registry reference is claimed.

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

Release the generic Shared Folder changes and update dependency pins deliberately
before publishing. Ready for code review does not authorize artifact publication.
