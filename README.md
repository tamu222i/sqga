# 🧸 Roblox ASMR Squishy Gacha

Roblox風 ASMRスクイーズ開封ガチャゲーム。
Web Audio APIによる完全手続き型音響合成（テープ切断音、アルミ袋破断音、低反発ウレタンのため息、ぷるぷるジェルのスキーク音、スライムのプチプチ音）と、マルチタッチ対応の弾性物理変形スクイーズを楽しめるWeb/タブレット対応ゲームです。

---

## 🚀 GitHub Pages へのデプロイ方法 (Deploy to github.io)

本プロジェクトはGitHub Pages（`https://<ユーザー名>.github.io/<リポジトリ名>/`）に完全対応しています。
アセットパスは相対パス（`./assets/...`）として出力され、SPA用の `404.html` および Jekyll無効化用の `.nojekyll` も自動生成されます。

### 方法 1: GitHub Actions による自動デプロイ（推奨）

リポジトリ内に `.github/workflows/deploy.yml` が用意されているため、プッシュするだけで自動デプロイされます。

1. GitHubにリポジトリを作成し、コードをプッシュします：
   ```bash
   git add .
   git commit -m "feat: Roblox ASMR Squishy Gacha"
   git branch -M main
   git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
   git push -u origin main
   ```
2. GitHubのリポジトリページを開き、**「Settings」** タブをクリックします。
3. 左サイドバーの **「Pages」** を開きます。
4. **「Build and deployment」** の **「Source」** を **「GitHub Actions」** に変更します。
5. 数分後、`https://<あなたのユーザー名>.github.io/<リポジトリ名>/` に自動公開されます！

---

### 方法 2: `gh-pages` コマンドによる手動デプロイ

ターミナルから直接 `gh-pages` ブランチにビルド結果をデプロイすることも可能です：

```bash
# 依存関係のインストール
npm install

# ビルド & gh-pagesブランチへのデプロイ
npm run deploy
```

---

## 🛠️ 開発・ローカル実行

```bash
# 開発サーバー起動 (Port: 3000)
npm run dev

# プロダクションビルド
npm run build

# ビルドプレビュー
npm run preview

# BDD/TDDテスト・型検証
npm run lint
```

---

## 📁 アーキテクチャ & ドキュメント
- **計画書**: [`plan.md`](./plan.md)
- **変更履歴**: [`changelogs/changelog.md`](./changelogs/changelog.md)
- **ドメイン層**: `/src/domain` (Zodスキーマ、ガチャ集約、物理復元サービス)
- **インフラ層**: `/src/infrastructure` (Web Audio ASMR合成、LocalStorage)
- **BDDテスト**: `/src/tests/bdd` (Given-When-Then 仕様・In-App テストランナー)
