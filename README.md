# Green Sophia SNS Copilot 🌿

上智大学 環境活動サークル Green Sophia のためのSNS運用ハブアプリ。
*Learn with us, act with Green Sophia, inspire others.*

## なにができるの？

| ナビ | 機能 |
|---|---|
| 🌱 ためる (Learn) | サークルLINE Botに送った参考スクショ・記事URLが自動で集まる棚 |
| ✍️ つくる (Act) | 条件を選ぶだけでClaude用の投稿プロンプトが完成 → コピーして使う |
| 🔍 ふりかえる | インサイトの数字を写すだけで、分析用プロンプトが完成 |
| 🎨 Canva棚 | サークル管理のCanvaテンプレURL一覧。原稿の流し込み先 |
| 📈 ひろげる (Inspire) | 月次実績を記録 → 企業提案用メディアキットのテキストを一発生成 |

**予算: 0円**（Vercel Hobby / Supabase Free / LINE Messaging API Free のみ。Make/Zapierは不要）

---

## セットアップ手順（所要 約30分）

### Step 1. Supabase（データベース）

1. https://supabase.com で無料アカウント作成 → `New Project`（リージョンは Tokyo）
2. 左メニュー `SQL Editor` → このリポジトリの `supabase/schema.sql` の中身を貼り付けて `Run`
3. `Project Settings > API` から以下をメモ:
   - `Project URL` → 環境変数 `SUPABASE_URL`
   - `service_role` キー → 環境変数 `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **絶対に外部に見せない**

### Step 2. LINE Messaging API（Bot）

1. https://developers.line.biz でプロバイダー作成 → `Messaging API` チャネルを作成
2. `チャネル基本設定` の **チャネルシークレット** → `LINE_CHANNEL_SECRET`
3. `Messaging API設定` で **チャネルアクセストークン（長期）** を発行 → `LINE_CHANNEL_ACCESS_TOKEN`
4. 同じ画面で「応答メッセージ」を **オフ**、「Webhook」を **オン** に
5. Webhook URLは Step 3 のデプロイ後に設定します

### Step 3. Vercel（ホスティング）

1. このプロジェクトをGitHubにpush
2. https://vercel.com で `Import Project` → リポジトリを選択
3. `Environment Variables` に `.env.example` の6項目をすべて設定
   - `GS_PASSCODE`: 部員に共有する「あいことば」（例: `midori2026`）
   - `AUTH_SECRET`: ターミナルで `openssl rand -hex 32` した結果
4. Deploy！ 発行されたURL（例 `https://gs-copilot.vercel.app`）を確認

### Step 4. Webhookをつなぐ

1. LINE Developersに戻り、Webhook URLに
   `https://＜あなたのURL＞/api/line/webhook` を設定 → `検証` で成功を確認
2. QRコードからBotを友だち追加 → 部員のグループにも招待
3. 試しにスクショ画像を送信 → アプリの「🌱ためる」に出てくれば完成 🎉

### ローカル開発

```bash
npm install
cp .env.example .env.local   # 値を埋める
npm run dev                   # http://localhost:3000
```

---

## LINE Botの使い方（部員向け・LINEノートにコピペ推奨）

- 📸 **参考になる投稿のスクショ** → そのまま画像を送るだけ
- 🤝 **スポンサー候補の記事** → 「`スポンサー https://... 一言メモ`」と送る
- 🖼 **参考デザインのURL** → 「`デザイン https://... 一言メモ`」と送る
- 💡 **それ以外のひらめき** → ふつうに文章を送ればメモとして保存

## 設計メモ（引き継ぎ用）

- **認証**: 部員共通パスコード + 署名Cookie（`middleware.ts`）。個人アカウント不要で代替わりに強い。漏れたら `GS_PASSCODE` を変えるだけで全員再ログインになる
- **DBアクセス**: すべてサーバー側（service_role）。RLSはポリシーなし=クライアント直アクセス全遮断
- **LINE画像**: LINE側の画像は一定期間で消えるため、Webhook受信時にSupabase Storageへ即保存
- **プロンプトの改良**: `lib/prompts.ts` を編集。ここがこのアプリの心臓部
- **Vercel Hobbyの注意**: 商用利用不可プランだが、非営利サークル利用はOK

## 今後の拡張アイデア（Phase 2候補）

- ストック棚に「この参考デザインを踏まえた投稿プロンプト」ボタン
- 投稿予定カレンダー（誰がいつ何を投稿するかの見える化）
- メディアキットのPDF出力
