# Changelog

## 2.37.2-0003

- Rebuild unchanged upstream 2.37.2 with CLI 0.42.2 and SDK/App 0.42.0
- Align the explicit templates pin with CLI 0.42.2 at published version 0.37.0
- Preserve the immutable upstream image, administrator-only entry and dedicated read-only share
- Prepare a review-only rebuild without a tag, release or catalog change

## 2.37.2-0002

- Repackage upstream 2.37.2 with SDK/App 0.38.2, CLI 0.41.9 and templates 0.35.5
- Default to the dedicated read-only Audiobookshelf share and validated installer ports
- Preserve administrator-only entry and use the selected OIDC issuer port
- Add the CLI app-open A/N/X smoke with an authenticated upstream Appbar marker


## 2.37.1-0010: SDK entry-gate migration

Built with SDK/App/templates 0.32.0, CLI 0.34.0 and executor v0.32.0.
Every request retains the DSM entry gate. No upstream-authenticated path exceptions are enabled in this build.
Protected executor payloads changed: administrator approval is required again after upgrading.
No NAS installation or device acceptance was performed for this rebuild.

## 2.37.1-0007

- Improve opening the App from the DSM menu and external access settings
- 改善從 DSM 選單開啟 App 與外網存取設定
