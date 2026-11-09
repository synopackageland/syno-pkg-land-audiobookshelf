# Changelog

## 2.37.2-0011

Select media subfolders with SDK 0.53.22 and CLI 0.52.14; preserve read-only mounts


## 2.37.2-0010

- en: Fix DSM sign-in when opening over HTTP
- zh-TW: 修正以 HTTP 開啟時的 DSM 登入
- zh-CN: 修复通过 HTTP 打开时的 DSM 登录
- ja: HTTP で開いた際の DSM サインインを修正
- ko: HTTP로 열 때 DSM 로그인 문제 수정
- de: DSM-Anmeldung beim Öffnen über HTTP korrigieren
- fr: Corriger la connexion DSM lors de l’ouverture via HTTP

## 2.37.2-0008

- en: Install wizard: port conflicts only warn; shared folder selection fixed
- zh-TW: 安裝精靈：連接埠衝突僅顯示警告；修正共享資料夾選取
- zh-CN: 安装向导：端口冲突仅显示警告；修复共享文件夹选择
- ja: インストールウィザード：ポートの競合は警告のみ表示し、共有フォルダーの選択を修正
- ko: 설치 마법사: 포트 충돌은 경고만 표시하며 공유 폴더 선택 문제 수정
- de: Installationsassistent: Portkonflikte zeigen nur eine Warnung an; Auswahl freigegebener Ordner korrigiert
- fr: Assistant d’installation : les conflits de ports affichent un avertissement ; sélection du dossier partagé corrigée

## 2.37.2-0007

- Pin CLI 0.47.1 for DSM data-share grants on selected existing Shared Folders
- Use the generated upgrade wizard's retained folder selection and native grant
- Keep SDK/App 0.44.1, administrator-only ingress, the official image and read-only media
- Validate one in-place WebAPI upgrade from 0006 without repeating broader acceptance

## 2.37.2-0006

- Pin SDK/App 0.44.1 to fix installer commands inheriting the DSM CGI environment
- Keep CLI 0.44.0, templates 0.38.1 and executor/v0.39.0
- Preserve administrator-only access and the same upstream-authenticated path set
- Reproduce the exact artifact already verified by the 0005-to-0006 WebAPI upgrade

## 2.37.2-0005

- Use DSM HTTPS path ingress at `/audiobookshelf/` with CLI/SDK/App 0.44.0 and templates 0.38.1
- Remove the dedicated public gateway listener and installer port fields
- Scope API, share, Socket.IO and OIDC callback declarations relative to the ingress base
- Keep the official image, administrator-only entry, read-only media share and private data

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
