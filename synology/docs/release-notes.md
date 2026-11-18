# Release notes

## 2.38.0-0001

- en: Update to Audiobookshelf 2.38.0 with library scan and access control fixes
- zh-TW: 更新至 Audiobookshelf 2.38.0，修正媒體庫掃描與存取控制問題
- zh-CN: 更新至 Audiobookshelf 2.38.0，修复媒体库扫描与访问控制问题
- ja: Audiobookshelf 2.38.0 に更新（ライブラリースキャンとアクセス制御の問題を修正）
- ko: Audiobookshelf 2.38.0으로 업데이트(라이브러리 스캔 및 액세스 제어 문제 수정)
- de: Auf Audiobookshelf 2.38.0 mit Korrekturen für Bibliotheksscan und Zugriffskontrolle aktualisieren
- fr: Mise à jour vers Audiobookshelf 2.38.0 avec corrections de l’analyse de bibliothèque et du contrôle d’accès
- es: Actualización a Audiobookshelf 2.38.0 con correcciones del análisis de la biblioteca y del control de acceso
- it: Aggiornamento a Audiobookshelf 2.38.0 con correzioni alla scansione della libreria e al controllo degli accessi

Upstream upgrade to Audiobookshelf v2.38.0 (official image
`docker.io/advplyr/audiobookshelf:2.38.0@sha256:60064c23f32fd9099fd39e82c5132c51701d1221135bbca04cd099b589e1edc3`; the amd64 and arm64 revision labels match the tag
commit `1430c9fc`). Upstream fixes server crashes during library scans and book
saves and tightens access checks for playback sessions, media progress,
libraries, tags, collections and socket events. The upstream tag is merged
into the fork without changes to upstream files. SDK/App 0.53.25, CLI 0.53.16,
templates 0.41.5 and the packaging are unchanged.

## 2.37.2-0008

- en: Install wizard: port conflicts only warn; shared folder selection fixed
- zh-TW: 安裝精靈：連接埠衝突僅顯示警告；修正共享資料夾選取
- zh-CN: 安装向导：端口冲突仅显示警告；修复共享文件夹选择
- ja: インストールウィザード：ポートの競合は警告のみ表示し、共有フォルダーの選択を修正
- ko: 설치 마법사: 포트 충돌은 경고만 표시하며 공유 폴더 선택 문제 수정
- de: Installationsassistent: Portkonflikte zeigen nur eine Warnung an; Auswahl freigegebener Ordner korrigiert
- fr: Assistant d’installation : les conflits de ports affichent un avertissement ; sélection du dossier partagé corrigée

## 2.37.1-0011

Built with published SDK/App/templates 0.32.0, CLI 0.34.0 and executor v0.32.0.
The fixed client prefixes in the README use upstream authentication; browser
entry and every unlisted route retain the existing DSM gate. Entry and login
policy are unchanged. Protected executors require administrator approval.
Mobile/native first-login and deployed client acceptance remain unverified.
See [mobile and native clients](../README.md#mobile-and-native-clients) for the
exact prefix list, upstream credentials, revocation and client limitations.
