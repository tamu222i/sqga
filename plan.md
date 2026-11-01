# Roblox風 ASMRスクイーズ開封ガチャ (Roblox ASMR Squishy Gacha) 開発計画書 (plan.md)

## 1. プロジェクト概要 & ビジョン
Robloxで爆発的人気を誇る「ASMRスクイーズ開封シミュレーター」の興奮と癒やしをWebブラウザおよびタブレットで忠実に再現するゲーム。
「音フェチ（ASMR）」に徹底的にこだわり、テープを切る音、アルミブラインドバッグを裂く音、プチプチ気泡を弾く音、そしてスクイーズ（低反発ウレタンフォーム、ぷるぷるジェル、サクサクスライム、もっちり餅）を揉み込むリアルな音と物理変形を実現します。

## 2. 簡易ドメイン駆動設計 (Lightweight DDD) & スキーマ駆動

### ユビキタス言語 (Ubiquitous Language)
- **Squishy (スクイーズ)**: 開封して手に入る癒やしの触感トイ。素材種別（MemoryFoam, WaterGel, CrunchyFloam, MochiElastic）と反発速度・硬さを持つ。
- **BlindBag (ブラインドバッグ)**: 中身の見えないスクイーズ包装。テープ封緘（Tape Strip）とアルミ外装（Crinkle Foil）で二重保護。
- **TapeStrip (テープストリップ)**: カッターや指先でスワイプして切ると「シュパーッ」と鳴る封テープ。
- **SoundProfile (音フェチ音響プロファイル)**: 各スクイーズが固有に持つWeb Audio合成音（FoamSigh, GelSqueak, SlimeCrunch, AcrylicTap, Pop）。
- **GachaBanner (ガチャ筐体)**: テーマ別の排出プール（ベーカリー、スライム・水滴、ネオンサイバー、ゴールドレジェンド）。天井（Pity System）を持つ。
- **DelightScore (快感スコア / ASMRポイント)**: 揉む・叩く・開封するたびに蓄積される癒やし通貨。

### レイヤー構造
1. **Domain Layer (`/src/domain`)**
   - `model/`: Squishy, Banner, Inventory, PlayerProfile, PhysicsEngine
   - `schemas/`: Zodによる厳密な型定義とバリデーション
   - `services/`: GachaDomainService（排出確率・天井計算）、SquishPhysicsService（メッシュ変形・復元シミュレーション）
   - `events/`: TapeCutEvent, BagTornEvent, SquishAppliedEvent
2. **Application Layer (`/src/application`)**
   - `usecases/`:
     - `OpenBlindBagUseCase`: テープ切断・袋開封・排出決定・コレクション追加
     - `SquishItemUseCase`: タッチ/ドラッグ座標と圧力に応じた変形計算 & ASMR音響発振
     - `ManageShelfUseCase`: お気に入りスクイーズを棚に飾って自動スクイーズ
3. **Infrastructure Layer (`/src/infrastructure`)**
   - `audio/WebAudioAsmrEngine.ts`: 外部ファイル依存なしのプロシージャルWeb Audio ASMR合成エンジン
   - `storage/LocalStorageRepository.ts`: Zodスキーマによる保存データ検証・復元
4. **Presentation & Test Layer (`/src/presentation`, `/src/tests`)**
   - UI: ガチャステージ、開封シミュレーター（テープカット・袋破り）、スクイーズプレイグラウンド（自由変形）、コレクション棚
   - BDD/TDD: 実装前仕様に基づくテスト（In-App BDD Test Dashboardで即時検証可能）

## 3. ASMR音響エンジニアリング (Web Audio API)
外部音声ファイルのロード失敗や遅延を防ぐため、Web Audio APIによる完全手続き型音響合成を採用：
1. **テープカット音 (Tape Snip & Zip)**: 高域帯域通過フィルター（High-pass BiquadFilter 3.5kHz）を通したピンクノイズ + 指先の移動速度に応じたピッチ変調
2. **アルミ袋クランチ音 (Foil Crinkling)**: 連続インパルスノイズとランダムレゾナンスによる金属箔のパリパリ音
3. **低反発フォームのため息音 (Foam Decompression Sigh)**: 超低域ローパス（180Hz）とゆっくり減衰するホワイトノイズの吸気・呼気
4. **ジェルスクイーズの鳴き音 (Gel Squeak)**: 2オペレーターFMシンセシス（搬送波800Hz〜2200Hzを指数変調）
5. **スライムのプチプチ音 (Slime Bubble Pop & Crunch)**: ランダムバーストの短インパルス発振（20ms）の多重散乱
6. **アクリル爪タップ音 (Fingernail Tap)**: 急峻なQ値（Q=18）のバンドパス共振によるクリアなコツコツ音

## 4. BDD / TDD テスト計画
- **Feature 1: ガチャ確率と天井保証 (Gacha Pity Guarantee)**
  - *Given*: 天井カウントが9のプレイヤー
  - *When*: 10回目のガチャを引いたとき
  - *Then*: 必ずRare以上のスクイーズが排出され、天井がリセットされること
- **Feature 2: スクイーズの物理変形と反発 (Squishy Physics & Slow-Rise)**
  - *Given*: 低反発ウレタン素材のスクイーズ
  - *When*: 中心部を押し込み（圧搾力 0.8）、指を離したとき
  - *Then*: 復元速度係数に従い、指定秒数かけて元の形状にスムーズに復元すること
- **Feature 3: ASMR音響発振の安定性 (Audio Synthesis Robustness)**
  - *Given*: 連続した高速マルチタッチ
  - *When*: 毎秒20回以上の変形イベントが発生したとき
  - *Then*: オーディオバッファが破綻せず、ボイススロットが適切にリミットされること
- **Feature 4: スキーマバリデーション (Schema Driven Persistence)**
  - *Given*: 不正なデータ構造または破損したLocalStorage
  - *When*: 起動時にリポジトリが読み込みを行ったとき
  - *Then*: Zodバリデータがフォールバックし、正常な初期プレイヤー状態に復帰すること

## 5. ロールアウトステップ
- Step 1: `plan.md` & `changelogs/changelog.md` の策定
- Step 2: ドメインモデル・Zodスキーマ・BDDテスト仕様の作成
- Step 3: Web Audio ASMR合成エンジンの構築（テープ、箔、フォーム、ジェル、スライム、タップ）
- Step 4: スクイーズ物理変形キャンバスエンジンの構築（マルチタッチ対応、ドラッグ変形、復元スプリング）
- Step 5: Roblox風UI・開封儀式（テープカットスライダー・袋裂きアニメーション・星ランク演出）
- Step 6: ガチャ筐体・コレクション図鑑・ASMR音響スタンド
- Step 7: BDDテストスイートの実行 & 品質検証
- Step 8: GitHub Pages (github.io) デプロイ対応（ベースパス相対化、Actionsワークフロー、404フォールバック、.nojekyll）

## 6. GitHub Pages デプロイ仕様 (github.io Deployment)
- **Base Path 戦略**: `base: process.env.VITE_BASE_PATH || './'` を設定し、`https://<ユーザー名>.github.io/<リポジトリ名>/` のようなサブディレクトリ配下でも、ルートドメインでもそのまま動作する完全相対パス出力（`./assets/...`）を採用。
- **CI/CD 自動化**: `.github/workflows/deploy.yml` により、`main` / `master` ブランチへのプッシュ時に自動でビルドおよび GitHub Pages へのデプロイを実行。
- **Jekyll 干渉防止**: `public/.nojekyll` を配置し、アンダースコア付きディレクトリやアセットが欠落する問題を防止。
- **SPA ルーティング保護**: `public/404.html` を配置し、ページリロード時や直接アクセス時にも壊れずSPAへ安全にリダイレクト。
- **手動デプロイのサポート**: `gh-pages` パッケージを追加し、`npm run deploy` による即時ブランチデプロイも可能。

