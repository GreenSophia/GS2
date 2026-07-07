// ============================================================
// プロンプトテンプレート
// アプリの心臓部。ここを育てていくと出力の質が上がります。
// ============================================================

const CIRCLE_CONTEXT = `# あなたの役割
あなたは上智大学の環境活動サークル「Green Sophia」のSNS担当アシスタントです。

# サークルの基本情報
- 活動理念: "Learn with us, act with Green Sophia, inspire others."（共に学び、共に行動することで、誰かを刺激する）
- Instagram: @greensophia_insta（フォロワー約1,800人 / 学生サークルとしては大規模）
- 姉妹アカウント「旅するGreen」、Podcast「GSラジオ」、オリジナルグッズも展開
- 主な活動: ビーチクリーン、ごみアートコンテスト、環境×アート（廃コスメでアクセサリー等）、
  企業コラボ（SARAYA等）、学食コラボ販売、農業体験、フェアトレード勉強会
- 投稿トーン: やわらかいパステル・水彩・手描きテイスト。説教くさくならず、
  「へぇ！」と思える身近な切り口で環境問題への入口をつくる
- 絵文字は適度に使用（🌏🌿✨など）。堅すぎず、チャラすぎず。`;

export type PostPromptInput = {
  theme: string;        // 活動テーマ
  detail: string;       // イベントの詳細・伝えたいこと
  target: string;       // ターゲット層
  slides: number;       // 画像枚数（カルーセル）
  goal: string;         // 投稿のゴール
  cta: string;          // 読者にしてほしい行動
};

export function buildPostPrompt(i: PostPromptInput): string {
  return `${CIRCLE_CONTEXT}

# 今回の依頼
以下の条件で、Instagramカルーセル投稿の「Canvaに流し込む用の完成原稿」を作ってください。

- 投稿テーマ: ${i.theme}
- 内容・詳細: ${i.detail || '（特記なし。テーマから自然に展開してください）'}
- ターゲット: ${i.target}
- 画像枚数: ${i.slides}枚
- この投稿のゴール: ${i.goal}
- 読者にしてほしい行動(CTA): ${i.cta || 'プロフィールのリンクをチェック / DMで気軽に質問'}

# 出力フォーマット（このまま守ってください）
## スライド構成
各スライドについて:
- 【n枚目】役割（表紙 / 問題提起 / 解説 / まとめ 等）
- 見出し（15字以内・キャッチー）
- 本文（スライドに載せる文。1枚あたり60字以内）
- ビジュアル指示（Canvaで作る人向けの具体的なメモ。色味・イラスト・写真の指定）

## キャプション
- 冒頭1行目はフィードで切れる前提で、続きを読みたくなる一文に
- 本文は200〜300字、改行と絵文字で読みやすく
- 最後にCTA

## ハッシュタグ
3グループに分けて計15個前後:
- ビッグタグ（#sdgs 等の大規模タグ）
- ミドルタグ（#ビーチクリーン 等のテーマタグ）
- 独自・大学タグ（#上智大学 #greensophia 等）

# 注意
- 1枚目は3秒で指を止めさせる。疑問形か意外な数字が有効
- 専門用語には必ず一言の補足を
- 誇張やエビデンスのない断定はしない`;
}

export type AnalysisPromptInput = {
  month: string;
  followers: string;
  followersDiff: string;
  reach: string;
  profileViews: string;
  postsCount: string;
  bestPost: string;
  worstPost: string;
  tried: string;
};

export function buildAnalysisPrompt(i: AnalysisPromptInput): string {
  return `${CIRCLE_CONTEXT}

# 今回の依頼
Instagramの月次インサイトを分析し、来月の運用施策を提案してください。

# ${i.month} の実績データ
- フォロワー数: ${i.followers}（前月比 ${i.followersDiff || '不明'}）
- 月間リーチ: ${i.reach}
- プロフィール閲覧数: ${i.profileViews || '未計測'}
- 投稿数: ${i.postsCount}
- 最も伸びた投稿: ${i.bestPost || '未記入'}
- 伸びなかった投稿: ${i.worstPost || '未記入'}
- 今月試したこと: ${i.tried || '特になし'}

# 出力フォーマット
## 1. 今月のひとこと総評（3行以内）
## 2. 数字から読み取れること（良かった点・課題点を各2〜3個、必ず数字を根拠に）
## 3. 伸びた/伸びなかった投稿の仮説（なぜそうなったか）
## 4. 来月の施策 3つ（それぞれ「何を・いつ・どう測るか」まで具体的に）
## 5. 来月の投稿ネタ 5案（1行ずつ。サークルの活動テーマに沿って）

# 注意
- 学生が週数時間で運用している前提で、無理のない施策に
- 「バズらせる」より「入会・イベント参加につなげる」ことを優先`;
}

// ---------- メディアキット用テキスト ----------
export type MetricRow = {
  month: string;
  followers: number | null;
  reach: number | null;
  profile_views: number | null;
  posts_count: number | null;
  best_post: string | null;
};

export function buildMediaKitText(rows: MetricRow[]): string {
  const fmt = (n: number | null) => (n == null ? '—' : n.toLocaleString('ja-JP'));
  const lines = rows.map((r) => {
    const m = new Date(r.month + 'T00:00:00');
    const label = `${m.getFullYear()}年${m.getMonth() + 1}月`;
    return `- ${label}: フォロワー ${fmt(r.followers)}人 / リーチ ${fmt(r.reach)} / プロフィール閲覧 ${fmt(r.profile_views)} / 投稿 ${fmt(r.posts_count)}本`;
  });
  const latest = rows[0];
  return `【Green Sophia Instagram 実績サマリー】
上智大学環境活動サークル Green Sophia（@greensophia_insta）

■ 最新の規模
フォロワー: ${fmt(latest?.followers ?? null)}人 / 直近月間リーチ: ${fmt(latest?.reach ?? null)}

■ 月次推移
${lines.join('\n')}

■ アカウントの特徴
・学生サークルとしては国内有数の規模の環境系アカウント
・ビーチクリーン、環境×アート、企業コラボ、学食コラボなど幅広い企画力
・Podcast「GSラジオ」、姉妹アカウント「旅するGreen」等のメディア展開

※本データはInstagramインサイトに基づく自社集計です。`;
}
