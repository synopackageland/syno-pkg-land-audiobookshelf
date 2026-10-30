# Changelog

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
