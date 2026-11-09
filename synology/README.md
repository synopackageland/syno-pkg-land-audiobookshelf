# Audiobookshelf for DSM

This folder-picker candidate is blocked by legacy upgrade wizard prefill and
CLI baseline compatibility; see [validation](docs/validation.md). Do not release it.


## Current package

Version **2.37.2-0011** packages unchanged upstream **v2.37.2** with
SDK/App **0.53.22**, CLI **0.52.14**, templates **0.41.5** and executor
**v0.53.5**. The App renders the upstream UI and has no SDK UI-kit dependency.
Build and device acceptance are recorded in [validation.md](docs/validation.md).

## Mobile and native clients

`identity_gateway.ingress.path` is `/audiobookshelf/`. Gateway policy paths are
relative to this base; `identity_gateway.upstream_auth_paths` is exactly:

```text
/feed
/public
/hls
/socket.io
/status
/auth/refresh
/api
```

These fixed prefixes are case-sensitive and match complete path segments.
They bypass DSM admission and keep upstream authentication and authorization.
All other paths, including browser entry, retain the existing DSM gate.

Clients use the DSM HTTPS origin with the `/audiobookshelf/` base path.
The SDK scopes these declarations once; the upstream receives full paths such as
`/audiobookshelf/api` and `/audiobookshelf/socket.io`. The exceptions cover API calls, token refresh, status, Socket.IO,
HLS, public resources and RSS feeds. Audiobookshelf validates native tokens and
permissions where required; its public resources and feed/share URLs retain
their upstream public or secret-link behavior. Manage and revoke tokens and
shares in Audiobookshelf; DSM logout does not immediately revoke them.
The browser root and `/audiobookshelf/` remain DSM-gated, as does
`/audiobookshelf/auth/openid/callback`. Password login remains disabled by the
existing packaging policy. Existing-token access is the intended boundary;
mobile OIDC callback/onboarding and complete share HTML flows remain unverified.

DSM package for upstream **v2.37.2**, SPK **2.37.2-0011**, x86_64,
DSM 7.2.1+ with Container Manager. The official image is immutable and unmodified.
All package-owned files are under this directory.

The SDK embedded OIDC provider signs the stable DSM subject. Native OpenID
registration and automatic login are enabled; matching by email/name is disabled.
DSM administrators receive individual upstream administrator accounts. Native
password login is disabled. Browser entry remains **administrator-only**;
ordinary DSM users receive the SDK access-denied page.

## Media and private storage

The native install wizard selects an existing media folder at any depth inside
a supported local ACL shared folder, mounted **read-only at `/media`**.
DSM grants the package account read access to the whole share. The App does not
create a share or write ACLs. Private state stays in the existing named volume.
See [folder selection](docs/folder-picker.md) for the migration and grant boundary.
Downloading podcasts into this read-only media mount remains unsupported.

The DSM HTTPS server owns the public `/audiobookshelf/` route. There is no
dedicated public gateway listener or installer port field. The local OIDC issuer
uses loopback port **13380**, matching `ABS_OIDC_PORT` in the container environment.
Upgrades retain the saved media selection and private identity state; old saved
port values are no longer used by this package.

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

Release pins in `toolchain.json` use SDK/App 0.53.22, CLI 0.52.14,
templates 0.41.5 and executor/v0.53.5. Builds use the published packages and SDK modules.

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

The native frontend is compiled at `/audiobookshelf/`. DSM redirects the bare
`/audiobookshelf` path to its trailing-slash form;
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
