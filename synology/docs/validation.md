# Validation scope

## 2.37.2-0013 — CLI 0.53.16 rebuild

Published CLI 0.53.16 (range ~0.53.16, locked 0.53.16) replaces 0.52.16. CLI
0.53.16 declares the nginx reload only for start and stop, so INFO keeps
`startstop_restart_services="nginx.service"` and no longer has
`instuninst_restart_services`; installation no longer reloads nginx while
Package Center queries package information. SDK/App 0.53.25, templates 0.41.5,
executor v0.53.6 and the official image digest are unchanged; only `synology/`
packaging files change.

Packaging-only rebuild: render freshness, check, the x86_64 build and inspect
against the previous official 2.37.2-0012 SPK pass, followed by an archive
comparison and privacy scans of current packaging and the generated SPK. Unit
tests and device installation were not run.

## 2.37.2-0012 — SDK 0.53.25 disk scratch

Published SDK/App 0.53.25 and CLI 0.52.16 (range ~0.52.16, locked 0.52.16)
replace 0.53.23/0.52.15; executor is v0.53.6 and templates remain 0.41.5. The
rendered Compose no longer declares a `/tmp` tmpfs; `compose.services.web.scratch`
declares `/tmp` on disk and the environment sets `TMPDIR=/tmp`. The service
already uses an explicit entrypoint and command. No memory tmpfs remains: the
upstream needs no socket or lock files in memory. Only `synology/` packaging
files change; the official image digest is unchanged.

Ten unit/folder/version tests, the Go entry contract, render freshness, check,
the x86_64 build with the previous official SPK as `--baseline`, and inspect
with the same baseline pass with no findings. Approval retention remains
`unknown` (no executor inventory). The generated Compose has no tmpfs and binds
the package scratch directory at `/tmp`.

One device pass on DSM 7.4.1 upgraded the previous official 2.37.2-0011
(installed for the test, `/tmp` was tmpfs mode 1777) to 2.37.2-0012. The
package runs; in the container `/tmp` is a bind of the package scratch
directory on the btrfs data volume (not tmpfs), mode 0700, owned by the
package UID/GID, writable, with `TMPDIR=/tmp`. `/healthcheck` returns 200 and a
DSM administrator reaches the upstream main page through the DSM gateway. The
test installation and its fixture folder were removed afterwards. Playback,
media scanning, normal-user denial and other DSM versions were not repeated.

## 2.37.2-0011 — SDK 0.53.23 folder selection

Published SDK/App 0.53.23 and CLI 0.52.15 (range ~0.52.15, locked 0.52.15)
replace the earlier candidate dependencies. Templates remain 0.41.5 and executor
v0.53.5. Only `synology/` changes; the official upstream image is unchanged.

Check, the sole declared x86_64 release build with the previous official SPK as
`--baseline`, and inspect with the same baseline pass with no findings. Historical
wizard artifacts are accepted. The baseline approval-retention field remains
`unknown` because it requires an executor inventory; no executor approval
retention is claimed. Direct archive comparison confirms identical
`conf/privilege` (`run-as: package`), service UID policy, capabilities, host
elevation, networks and media mount permissions. No root or ACL writer is added.

All five folder/wizard regression tests pass, including legacy share-only
prefill, saved two-level paths, omitted-answer postinst, nonblocking post-grant
checks, and executed DSM version fixtures for 7.1, 7.2.1, 7.2.2, 7.3.2 and
unknown versions. The Go entry contracts using SDK 0.53.23 pass where present.

Two independent real upgrades on DSM 7.3.2 start from the previous official SPK
with a legacy record containing only `shared_folders`. The silent upgrade omits
all folder answers and preserves the original record bytes. The separate native
Package Center wizard prefills the original share root, requires no new folder
choice, and submits the displayed retained selection. Its normalized record
adds an explicitly empty subpath without changing the selected folder. Both
upgrades complete at the target version with running status. Independent
readback verifies the original host source, package UID, zero effective/permitted
capabilities, unchanged synthetic file content and refused writes to the
read-only media mount. Container Manager's own NET_BIND_SERVICE bounding setting
remains present; it is not an added manifest capability.

The folder wizard heading and introduction follow the English Package Center
UI even though the account's saved language differs. Full wizard and native
chooser screenshots were retaken in English. Browsing the tree and canceling
the chooser leaves the retained root unchanged before the actual upgrade.

This focused rerun covers the previously failed baseline and legacy-upgrade
paths. The earlier two-level fresh-install checks belong to the SDK 0.53.22
candidate and remain archived with that version. Fresh installation, playback,
App sign-in, old-DSM device acceptance and broader suites were not repeated.

Scoped source/expanded-SPK privacy scans and owned fixture cleanup are recorded
with the private artifacts. Package identities are retained; the operator ran
no image deletion or prune commands. No merge, release, catalog change or
Actions enablement is part of this migration.
Earlier evidence below keeps its original version and acceptance boundaries.

## 2.37.2-0007 CLI 0.47.1 shared-folder rebuild

Pin published CLI **0.47.1**; SDK/App **0.44.1**, templates **0.38.1** and
executor **v0.39.0** stay unchanged. The official image, administrator-only
policy, same-origin ingress and read-only media selection are preserved.
The generated resource now uses the selected `media` variable in DSM data-share
with package-account RO permission. The generated upgrade wizard rendered an existing folder from a local retained
configuration, without a separate change checkbox; supported-folder validation
was inspected. No App ACL writer is added.

The five version tests, render freshness, check/build/inspect (`findings=[]`),
official registry lock URLs and scoped source/expanded-SPK scans passed.
Artifact: **37,557,760 bytes**, SHA-256
`c51cb032692edf03b6456b0e61f79441b63cd89db60b15c327f79076985fe54c`.

Exactly **one Package Center WebAPI upgrade, 0006 to 0007**, completed and reached
running, without error **4541**. It explicitly submitted the existing saved
folder to the new installer; the selection did not change. The device log records
zero exit codes for preupgrade, preinst, postinst, postupgrade, prestart and start,
and successful DSM data-share acquisition. The installed resource retains the
selected-folder RO grant, the running container reads `/media`, and the official
image/nonroot/cap_drop ALL/no-new-privileges/read-only-rootfs settings remain.
Library records, stable user IDs/roles, progress, OIDC settings, saved-folder
configuration and bootstrap-key hashes compare equal before and after upgrade.

The full browser/lifecycle matrix was not repeated. This run verifies retained
folder upgrade and generated wizard/resource behavior; it does not claim a fresh
interactive wizard run or a new-share grant with no prior ACL. Earlier browser
and SDK entry-contract evidence below keeps its original version scope. No merge,
tag, release or publication was performed.

## 2.37.2-0006 SDK 0.44.1 installer fix

Pin SDK/App **0.44.1** from published release commit
`2f2a1d30c147b401267a3daff42eb9a3a01d8ba1`. CLI **0.44.0**, templates
**0.38.1** and executor **v0.39.0** remain pinned. The gateway patch dispatches
explicit installer commands before inspecting the inherited CGI environment.
The application image, OIDC settings, path-prefix set and administrator-only
admission stay unchanged. Prefix declarations use the same order as the verified
upgrade artifact; the nonoverlapping path set and access behavior are unchanged.

This rebuild passed the affected nonroot SDK entry-contract test, render
freshness, CLI check/build/inspect (`findings=[]`) and scoped source/expanded-SPK
privacy scans. The version-test source is unchanged; its previous 5/5 result
is retained. The SDK release gate and previous App browser matrix were not rerun.

The rebuilt SPK is **byte-for-byte identical** to the already tested published-SDK
upgrade artifact: **37,557,760 bytes**, SHA-256
`1e17a02c608c67319a393f32c03c90a0fba481ea3f67cc2f5523917159bd2232`.
That artifact upgraded **0005 to 0006 through Package Center WebAPI**, using the
published CLI installer, and reached running. The device log records zero exit
codes for preupgrade, preinst, postinst, postupgrade, prestart and start, with
**no 4541**. The incoming build-policy digest deliberately differed from 0005,
covering the original failure condition. Library, stable users, progress,
authentication settings and bootstrap-key hash comparisons all passed.

The exact artifact match carries that existing WebAPI result to this rebuild;
no duplicate upgrade, reinstall, downgrade or browser matrix was performed.
Read-only package version/status confirms **0006 running**. No uninstall, user
data deletion or DSM setting change was performed. Detailed artifact matching
and bounded evidence are recorded in `build-proof.json`; private handoff logs
remain outside Git.

The prior administrator/ordinary-user/signed-out browser results below are
retained with their original 0005 scope. **Administrator-only access is the
required policy**; ordinary users receiving 403 is a passed authorization check.
There is no pending request to widen access. The old CGI dispatch blocker is
resolved for the WebAPI upgrade by SDK 0.44.1 and the verified 0006 artifact.
Full lifecycle, media playback and release gates remain outside this task.

## 2.37.2-0005 custom DSM path ingress

Published CLI/SDK/App **0.44.0**, templates **0.38.1**, executor **v0.39.0**.
The official upstream image is unchanged. All edits remain under `synology/`.
`build-proof.json` records the exact SPK hash and bounded acceptance results.

The affected version tests passed 5/5. The SDK gateway entry-contract test passed
as a nonroot process against both the manifest and the expanded SPK policy.
It exercises scoped API prefixes, preserved credentials, reserved/protected
routes and rejection outside the selected ingress. Render freshness, CLI check,
x86_64 build and inspect passed with no inspect findings. Scoped source and
expanded-SPK scans passed with the private denylist.

An existing **2.37.2-0004** installation upgraded in place to **0005** through
native `synopkg install`, without uninstalling or deleting data. Exact library
and progress records, stable user IDs/roles, OIDC settings, media selection and
bootstrap-key hashes were retained. The official running image, nonzero UID/GID,
cap_drop ALL, no-new-privileges and read-only rootfs were independently checked.
The old public port **30443** has no IPv4 or IPv6 listener; upstream **13378**
and issuer **13380** remain bound to IPv4 loopback.

A fresh browser opened the real DSM main-menu item and reached the App on the
same DSM HTTPS origin under `/audiobookshelf/`. **23 distinct Nuxt JavaScript
assets** loaded with HTTP 200 or valid 304 cache responses, with no failing
App responses. The authenticated libraries API returned 200. Socket.IO used
`/audiobookshelf/socket.io/`, connected over WebSocket and received frames.
An ordinary signed-in user received HTTP 403 / `dsm_admin_required`. A fresh
signed-out visitor saw DSM login without App content; its unauthenticated
libraries API request returned 401. Self-signed certificate tolerance was limited
to the disposable browser. No certificate trust or DSM settings were changed.

### Acceptance limits and installer defect

The existing `admin-only` / `dsm-admins` rules are preserved. Ordinary-user
denial is the required and verified outcome; no access expansion is requested.

The first CLI WebAPI upgrade attempt failed in `preupgrade` with
`gateway entry policy does not match package build policy`. DSM restored 0004
and restarted it; library and progress comparisons passed after recovery.
A read-only reproduction showed the published `ingress-check` succeeds normally,
but with inherited `GATEWAY_INTERFACE=CGI/1.1` it enters CGI dispatch and loads
the old installation policy. The same unmodified SPK then passed all native
upgrade hooks through `synopkg install`. This historical 0005
failure is resolved by the published SDK 0.44.1 and WebAPI-tested 0006 artifact
described above. No App-side bypass is shipped.

Full lifecycle, playback, revocation, trusted external access and a release gate
were not rerun. No release or publication is authorized by this evidence.
Private rollback archives, device evidence and screenshots remain outside Git.

## Earlier acceptance evidence


## 2.37.2-0003 CLI 0.42.2 rebuild

Rebuilt unchanged upstream 2.37.2 with published CLI 0.42.2, SDK/App 0.42.0,
executor/v0.39.0 (the SDK 0.42.0 release mapping) and templates 0.37.0. There is no UI-kit dependency to update.
All 122 npm lockfile download URLs use registry.npmjs.org. The live package
feed did not list this package; the repository baseline is 2.37.2-0002 and no
2.37.2 release tag exists, so this review candidate increments the build to 0003.
No tag, release or catalog change is part of this rebuild.

Existing version tests (5/5), the SDK-backed entry-policy test and render
freshness pass. Check, build and inspect pass for x86_64, the only declared
architecture; inspect has `findings=[]`. The detailed DSM format check retains
two nonfatal warnings about SDK-generated restart-service INFO fields.
The private-denylist scan and local-build-path scan pass over the integration
and expanded SPK. `build-proof.json` records the artifact and lockfile hashes.

One native in-place upgrade from 0002 to 0003 succeeds and Package Center reports
running. Before/after comparisons preserve the selected port-value file hashes,
bootstrap key hash, native authentication settings, media library definitions and
user IDs/permissions. The container image, nonzero package UID:GID, dropped ALL
capabilities, no-new-privileges and read-only rootfs also match.

An administrator signs into the DSM desktop; a DOM click on the Audiobookshelf
menu entry opens its generated launcher CGI
(`/webman/3rdparty/SynoPkgAudiobookshelf/sso/open.cgi`). The upstream authenticated
account link renders through the existing HTTPS gateway. Direct launcher CGI
navigation also passes.
The requested `/synopkgland/SynoPkgAudiobookshelf/` path returns HTTP 404.
This manifest has no native `daemon.ingress`; CLI check accepts its existing
Compose gateway route. The released fixed-prefix rule validates declared native
daemon ingress and does not automatically migrate this Compose App. No new
routing feature was added during the toolchain rebuild. The requested path is
therefore an explicit remaining acceptance gap for coordinator review.

No uninstall, data deletion, account changes, reboot, full e2e suite or full gate
was performed. Normal-user and anonymous browser checks were not repeated in
this administrator-only upgrade scope. Earlier evidence below is historical.

## 2.37.2-0002 SDK 0.38.2 rebuild

Pinned CLI 0.41.9, templates 0.35.5 and SDK/App 0.38.2, using published npm
packages and checksummed Go modules. All 121 npm lockfile download URLs use the
official registry. Linux x86_64 build and inspect pass with `findings=[]`.
Integration files, commit text and the expanded SPK pass the private-denylist
content scan. Artifact SHA-256 is recorded in `build-proof.json`.

Native in-place upgrade on DSM 7.3.2 passes and Package Center reports running.
The dedicated Audiobookshelf share stays read-only and the default gateway and
issuer ports remain 30443/13380. The container's nonzero package UID, ALL dropped
capabilities, no-new-privileges and read-only rootfs were read back during this
candidate's installation. No upstream source or image bytes were changed.

The final CLI 0.41.9 app-open smoke passes **A/N/X, 3/3, zero skips** over HTTPS:
administrator entry renders the upstream Appbar account link, the real non-admin
receives SDK access-denied without App content, and a fresh anonymous context
reaches the DSM sign-in gate. The released shared helper accepts self-signed DSM
and gateway certificates; no App-side TLS workaround was added.

Only the requested build, inspect, install and A/N/X scope was rerun after the
CLI fixes. No full e2e or regression suite was rerun. This minimal smoke does
not establish broader media, account-revocation or reboot lifecycle acceptance.
Earlier measurements below retain their explicitly named versions and scope.

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
