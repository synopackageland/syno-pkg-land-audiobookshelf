# Integration boundaries

| Requirement | Current boundary | Follow-up |
| --- | --- | --- |
| Media Shared Folder | One native install-selected read-only mount at `/media`; administrator grants the fixed package account access. Development SDK/CLI overrides required. | Release the generic changes and update pins explicitly before publication. Dynamic post-install authority remains outside this candidate. |
| Ordinary DSM users | The Compose gateway does not enforce the requested per-App Application Privileges contract. | Keep admins-only; implement generic permission enforcement, then test allowed and denied ordinary users. |
| Account deletion | No native deletion adapter is declared. Upstream has supported APIs but the bootstrap credential is private to its named volume. | Add a bounded credential-safe adapter through the existing bridge; define session/progress retention and test deletion. |
| Delete-data uninstall | SDK retains named container volumes even when delete-data is selected. The wizard reports the exact retained volume. | Preserve honest warnings and independent readback; implement generic volume lifecycle before promising erasure. |

Containers have fixed package filesystem authority. OIDC accounts do not inherit
DSM per-user file ACLs. Source read-only mounts cannot stop an already-open stream;
stop before revoking access. Library visibility belongs to upstream App policy.

The official image is unmodified. Its supported API configures native OpenID,
auto-registration and stable-subject matching. Startup reads back every setting
and fails closed if the protected bootstrap API key is unsafe, absent or revoked.
Native `/audiobookshelf/` assets and exact callback are tested alongside backend
health; a health check alone does not establish frontend usability.
