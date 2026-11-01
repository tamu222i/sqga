# 変更履歴 (Changelog)

All notable changes to the Roblox ASMR Squishy Gacha project are documented below.

## [1.1.0] - 2026-10-31

### Added
- **GitHub Pages (github.io) デプロイ対応**:
  - `vite.config.ts`: `base: process.env.VITE_BASE_PATH || './'` を設定し、`https://<ユーザー名>.github.io/<リポジトリ名>/` のサブパス環境に対応した相対パス解決を実装。
  - `.github/workflows/deploy.yml`: GitHub Actions による自動ビルド＆Pages公開ワークフローを追加（`main` / `master` ブランチへのプッシュで自動デプロイ）。
  - `public/.nojekyll`: GitHub Pages の Jekyll 処理によるファイル欠落を防止するファイルを設置。
  - `public/404.html`: SPA 直接アクセスやリロード時のルーティングエラーを防ぐリダイレクトフォールバックを追加。
  - `package.json`: `gh-pages` パッケージの導入と `"predeploy"`, `"deploy"` スクリプトを追加。
  - `README.md`: GitHub Actions および手動デプロイの手順を記載。

## [1.0.0] - 2026-10-31

### Added
- **スキーマ駆動 & 簡易DDD設計 (Schema-Driven Lightweight DDD)**:
  - `src/domain/schemas/index.ts`: Zodによる厳密な型定義（`SquishyItemSchema`, `GachaBannerSchema`, `PlayerProfileSchema`, `RaritySchema`, `MaterialTypeSchema`）。
  - `src/domain/model/catalog.ts`: 12種類以上の個性的なスクイーズカタログ（バタートースト、いちごドーナツ、黒糖タピオカ猫、桜もち、銀河エイリアン、極楽温泉カピバラ、黄金の神トーフ等）。
  - `src/domain/model/banners.ts`: 4つのガチャ筐体（ふんわりベーカリー、スライム＆アクア、電脳ネオン、秘宝黄金ヴォールト）。
  - `src/domain/services/GachaDomainService.ts`: 重み付き排出計算、天井保証（Pity System）ロジック、インベントリ集約と重複レベルアップ、ASMR快感スコア計算。
- **手続き型 Web Audio ASMR 音響エンジン (`WebAudioAsmrEngine`)**:
  - 外部ファイルへの通信遅延や404の心配がない100%プロシージャル合成音：
    - テープカット音（速度追従型バンドパスフィルター付き摩擦音）
    - アルミ袋パリパリ音（多重インパルスバースト）
    - 低反発フォームのため息音（スローライズ呼気・重低音ランブル）
    - ぷるぷるジェル鳴き音（FM変調スキーク音）
    - サクサクスライム音（クラスタパチパチ音）
    - アクリル爪タップ音（高Q共振クリック音）
    - レベルアップ・ファンファーレ（五音音階アルペジオ）
- **Roblox風 ASMRスクイーズ開封儀式 (`UnboxingStage`)**:
  - スワイプによるテープ切断アクション（ハサミ／カッター進行と切断音）
  - アルミ袋破断ギミック（クリック/タップで袋が破れて中身が出現）
  - レアリティ確定演出 & 紙吹雪エフェクト
  - 開封直後の「初揉み」インタラクティブプレビュー
- **リアルタイム物理変形スクイーズ (`SquishPlayground`, `SquishySvgRenderer`)**:
  - ポインターイベントおよびマルチタッチ対応の弾性・ポアソン比変形シミュレーション
  - 低反発（Slow-Rise）、ジェル、スライム、餅の固有復元スピード
  - 揉み込み、ツンツン連打、爪タップの3種のアクションモード
  - 表情変化（潰すと目を細め、口をパカッと開けるキュートなリアクション）
  - 浮遊するオノマトペASMRテキスト演出
- **コレクション棚 & 図鑑 (`CollectionShelf`)**:
  - 全スクイーズの素材・反発特性・ASMR音響一覧
  - 棚にあるスクイーズをワンタップでクイック鳴らし
  - お気に入りスクイーズをプレイグラウンドへ即座にセット
- **BDD / TDD テストスイート (`src/tests/bdd`)**:
  - Given-When-Then 仕様に基づいたドメインテスト（天井保証、重複統合、快感スコア、スキーマ検証）
  - アプリ内で実行可能な「BDDテストランナー」モーダル
- **計画書 & 変更履歴 (`plan.md`, `changelogs/changelog.md`)**:
  - プロジェクト構成、ユビキタス言語、音響パラメータ設計、テスト仕様のドキュメント化
