# Folder selection migration

| Key | Existing source | New source | Container path | Access | Purpose |
| --- | --- | --- | --- | --- | --- |
| media | Saved shared-folder root | Same share plus an optional relative folder path | /media | ro | Media library |
| data | Package-owned named volume | Unchanged named volume | /var/tmp | rw | Private App state |

Fresh installs use the SDK folder picker over existing mounted local ACL shares.
The picker uses mode `select`; it does not create a dedicated share. DSM grants
RO to the package account for the whole share, even when only a subtree is mounted.
The container continues to run as the package UID without added privileges.

Existing installations retain the `media` key. An absent or empty subpath means
the original share root. Omitted upgrade answers must preserve the saved record;
the wizard must prefill the original share without requiring another selection.
Only the released CLI/SDK owns selection, validation and permission recovery.

SDK-generated runtime secret binds and storage-init assets remain read-only at
`/synopkgland/secrets/` and `/synopkgland/storage-init`; they are not user-selectable
data folders. Temporary files use the SDK disk scratch at `/tmp`, not a
user-selectable folder.

Published SDK 0.53.23 and CLI 0.52.15 preserve legacy share-only records as the
share root in silent and wizard upgrades. See [validation](validation.md).
