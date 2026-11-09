# Audiobookshelf integration

Keep all package-owned changes under synology/. Do not edit upstream source.
Keep the recorded released dependency pins. Build publishable artifacts only with
the published CLI, templates and SDK modules.
Read the installed CLI's compose and identity-gateway guides before changes.
The explicit task chooses embedded OIDC over the scaffold's older header defaults.

Use the official image at the recorded immutable digest. The package account,
cap_drop ALL, no-new-privileges, read-only rootfs and loopback listeners are required.
Use SDK storage_init for private storage and secret delivery. Configure upstream
through supported APIs; never edit its database or add another identity service.

Use install.sharedFolder mode select and picker folder with matching
compose.shares select install and picker folder.
Default media access is read-only; DSM grants
the package identity RO access. Existing selections authorize DSM data-share
to grant the declared package-user access. Validate supported folders at installation and kernel access at runtime;
do not require a pre-existing grant or add an App-side ACL writer.
Keep entry admin-only and gateway dsm-admins. The normal-user smoke must verify
the SDK access-denied page; never widen entry to satisfy smoke. Do not claim account deletion
or immediate session revocation until the native bridge is implemented and tested.

Run the affected tests on an authorized Linux build host, then check/build/inspect.
Never install an artifact that fails inspect. Keep device evidence, credentials,
profiles and screenshots outside the public repository. Before each commit/push,
run scripts/public-scan.py with the operator's private denylist and inspect all
staged paths and artifact contents. Use the public maintainer identity and [skip ci].
GitHub Actions must remain disabled. Open a PR; publication needs separate approval.
