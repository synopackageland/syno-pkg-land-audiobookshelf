# Audiobookshelf for DSM

## SDK 0.26.0 rebuild

Rebuild 2.37.1-0004 with published SDK/App/CLI/templates 0.26.0, UI 0.14.4 and Go 1.26.10. Maintainer: Syno Package Land. Official images and application sources are unchanged. Check the selected shared folder permissions before starting; grant the package account the required access in DSM.

2.37.1-0004 使用已發佈 SDK/App/CLI/templates 0.26.0、UI 0.14.4 與 Go 1.26.10 重建；維護者顯示為 Syno Package Land。 官方映像與上游程式維持原樣。 啟動前檢查所選共用資料夾權限；請在 DSM 授予套件帳號所需存取權限。

DSM package for upstream **v2.37.1**, SPK **2.37.1-0001**, x86_64,
DSM 7.2.1+ with Container Manager. The official image is immutable and unmodified.
All package-owned files are under this directory.

The SDK embedded OIDC provider signs the stable DSM subject. Native OpenID
registration and automatic login are enabled; matching by email/name is disabled.
DSM administrators receive individual upstream administrator accounts. Native
password login is disabled. The candidate is **administrator-only**: the Compose
route does not yet enforce per-App DSM Application Privileges for ordinary users.

## Media and private storage

Select one existing Shared Folder in the native install wizard, or deploy with
`--param media=Media`. It is mounted **read-only at `/media`**. For example, create
an upstream library using `/media/audiobooks`. Podcasts may be read from this
folder, but downloading podcasts into the read-only mount is unsupported.

Selection does not grant access. In **Control Panel > Shared Folder > Edit >
Permissions > System internal user**, grant **SynoPkgAudiobookshelf** read access
and ensure child folders inherit it. The package container uses that fixed
account, not the signed-in user's filesystem ACL. Audiobookshelf library/user
settings control which App users see its mounted data.

Upgrade keeps the chosen name. To change it, pass both `--param CHANGE_media=true`
and `--param media=OtherMedia`, or use the native upgrade wizard. A moved share
needs another upgrade to resolve its new volume. To end existing streams, stop
the package before revoking ACL access: already-open files cannot be recalled.
Uninstall leaves the selected Shared Folder and its administrator-managed ACL.

Configuration, metadata and a private bootstrap API key live in the namespaced
`data` volume under `/var/tmp/audiobookshelf`. SDK `storage_init` creates private
0700 directories and supplies bootstrap/OIDC secrets. The container runs as the
package UID:GID, drops all capabilities, uses no-new-privileges, a read-only root
filesystem and temporary `/tmp`. Upstream listeners bind IPv4 loopback. Host
networking and internet egress are explicit; there is no egress allowlist.

**Uninstall retains named container data volumes even with delete-data selected.**
The native wizard warns about the exact volume. Do not treat that choice as data
erasure. No root cleanup hook or alternative ACL helper is shipped.

## Build and validation

Release pins in `toolchain.json` use CLI/templates/SDK/App 0.20.0,
UI 0.12.5 and executor/v0.20.0. Builds use the published packages and SDK modules.

On an authorized Linux builder, set `SPL_BUILDER_IMAGE` and
`SPL_RESOURCE_PREFIX`, then run `python3 scripts/build-linux.py`. It installs the
locked npm dependencies and runs affected tests, render freshness, check, build
and inspect. `build-proof.json` records the toolchain, artifact hashes and results.
The SSH coordinator `scripts/build.py` copies only integration files and retrieves
build evidence. Rust work stays on Linux. Credentials never enter the package.

`SPL_NPM_REGISTRY` can select an operator-approved npm mirror.
`SYNOPKGLAND_COMPOSE_REGISTRY_MIRRORS` changes metadata transport only; the final
SPK still references official Docker Hub digests. Do not modify NAS daemon/CA settings
or substitute image bytes. Device results and transport limits are in
[validation.md](docs/validation.md); the reusable browser suite is documented in
[e2e.md](docs/e2e.md). Credentials and raw device evidence never belong in Git.

## Identity limits

A package-private bootstrap account configures upstream through supported APIs,
disables password login and retains a 0600 API key for startup policy readback.
Unsafe/missing/revoked private state fails closed. No upstream database is edited.
There is no native account-deletion adapter yet. Existing upstream sessions,
API tokens and progress are not certified as immediately revoked on DSM logout,
disable or deletion. Native/mobile clients are not certified. See
[framework-gaps.md](docs/framework-gaps.md).

The native frontend is compiled at `/audiobookshelf/`. Root redirects there;
OIDC callbacks use `/audiobookshelf/auth/openid/callback`. Native auto-launch owns
the browser redirect and token handling; no second login page is added.

## Upgrades and provenance

The existing fork main follows upstream master beyond v2.37.1, which is already
an ancestor. Upstream files are untouched. `upstream-source.json` records both the
checkout baseline and exact release commit/tree used by the image.

After committing, `bash synology/upgrade.sh vX.Y.Z BUILD` merges the explicit
upstream release and rebuilds. Builds increment within an upstream release and
reset to 0001 for a newer release. It never pushes, releases or accesses a NAS.

Before each commit/push, run `scripts/public-scan.py` with the private operator
denylist over integration files, expanded SPK payloads, and commit/PR text. Keep
GitHub Actions disabled, use the public maintainer identity and `[skip ci]`.

## Official package icon

The DSM package uses the official project artwork, preserved unchanged and only resized/rasterized to the required icon sizes. See [assets/icon-source.json](assets/icon-source.json) for the source revision and original SHA-256, and [NOTICE](NOTICE) for attribution and the applicable image license. The package ID remains `SynoPkgAudiobookshelf` for upgrade continuity.
