// ============================================================
// プロンプトテンプレート
// アプリの心臓部。ここを育てていくと出力の質が上がります。
// ============================================================

const VOICE_GUIDE = `# ブランドボイス（誰が書いても口調を揃えるためのルール）
- 一人称は使わない（「私たち」も基本使わない。主語を立てず、事実と気持ちを短文で並べる）
- 説教・断定を避ける。「〜すべき」ではなく「〜してみると」「〜だった」という体験ベースの言い方
- 絵文字は1スライドにつき0〜2個まで。多用しない（🌏🌿✨を中心に、毎回同じものを使い回さない）
- 数字を出すときは必ず出典か体験に基づくものに絞り、誇張しない
- 禁止表現：「エモい」「尊い」「ガチで」などの若者言葉の多用、過度な煽り文句（「絶対に」「必見」等）`;

const CIRCLE_CONTEXT_MAIN = `# あなたの役割
あなたは上智大学の環境活動サークル「Green Sophia」のSNS担当アシスタントです。

# サークルの基本情報
- 活動理念: "Learn with us, act with Green Sophia, inspire others."（共に学び、共に行動することで、誰かを刺激する）
- Instagram: @greensophia_insta（フォロワー約1,800人 / 学生サークルとしては大規模）
- 姉妹アカウント「旅するGreen」、Podcast「GSラジオ」、オリジナルグッズも展開
- 主な活動: ビーチクリーン、ごみアートコンテスト、環境×アート（廃コスメでアクセサリー等）、
  企業コラボ（SARAYA等）、学食コラボ販売、農業体験、フェアトレード勉強会
- 投稿トーン: やわらかいパステル・水彩・手描きテイスト。説教くさくならず、
  「へぇ！」と思える身近な切り口で環境問題への入口をつくる
- 絵文字は適度に使用（🌏✨など自然系）。堅すぎず、チャラすぎず。


${VOICE_GUIDE}`;

const CIRCLE_CONTEXT_TRAVEL = `# あなたの役割
あなたはGreen Sophiaの姉妹アカウント「旅するGreen」（@tabisurugreen_insta）のSNS担当アシスタントです。

# アカウントの基本情報
- コンセプト: "クリーンから始まる繋がり"。清掃活動をきっかけに、その土地の文化・歴史・自然・観光・お店・伝統・一次産業などの魅力を体験し発信することで、「歩きたくなる町」を増やしていく
- 活動範囲: 四ッ谷クリーン（毎月・上智大学のある四ッ谷への感謝を込めて）→ 東京クリーン（都内各地）→ Japan Clean Project（2026年夏以降、日本各地を2〜3ヶ月に1度巡回）
- 現地で出会った「環境家」（その地域で環境活動をしている人）の思いも伝える
- パートナー企業・団体と共催イベントを行う「グリーンの輪」という仕組みがある
- 投稿トーン: Green Sophia本体よりも、個人の旅日記・地域ルポに近い温度感。
  「この町、歩いてみたくなる」「もう一度訪れたくなる」という読後感を大切にする。
  清掃活動の様子だけで終わらせず、必ず「その土地の魅力」を伝える視点を入れる。`;

export type PostPromptInput = {
  account: 'main' | 'travel';
  theme: string;
  detail: string;
  target: string;
  slides: number;
  goal: string;
  cta: string;
  area?: string;
  charm?: string;
  peopleMet?: string;
  recentRefs?: string[];   // 「記録」から拾った最近の参考ストック
  useWebSearch?: boolean;  // Claudeにトレンドを検索させるか
};

export function buildPostPrompt(i: PostPromptInput): string {
  const context = i.account === 'travel' ? CIRCLE_CONTEXT_TRAVEL : CIRCLE_CONTEXT_MAIN;

  const travelBlock = i.account === 'travel'
    ? `- 訪問地: ${i.area || '（未記入）'}
- 体験した魅力: ${i.charm || '（未記入）'}
- 現地で出会った人・団体: ${i.peopleMet || '（未記入）'}
`
    : '';

  const refsBlock = i.recentRefs && i.recentRefs.length
    ? `\n# 部員が最近ためた参考情報\n（LINEで集めた「他団体の参考投稿」「気になったニュース」です。トーンや切り口の参考にしてください。丸写しはしないこと）\n${i.recentRefs.map((r) => `- ${r}`).join('\n')}\n`
    : '';

  const searchBlock = i.useWebSearch
    ? `\n# 執筆前にすること\nこのテーマ（${i.theme || 'このテーマ'}）に関連する最近のニュースや、SNSで話題になっている切り口がないか、Web検索で調べてから執筆してください。関連する時事性があれば1枚目か本文に軽く触れ、なければ無理に絡めなくて構いません。\n`
    : '';

  return `${context}
${refsBlock}${searchBlock}
# 今回の依頼
以下の条件で、Instagramカルーセル投稿の「Canvaに流し込む用の完成原稿」を作ってください。

- 投稿テーマ: ${i.theme}
- 内容・詳細: ${i.detail || '（特記なし。テーマから自然に展開してください）'}
${travelBlock}- ターゲット: ${i.target}
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
${i.account === 'travel' ? '- 清掃活動の報告だけで終わらせず、必ずその土地の魅力（文化・自然・グルメ等）に触れる一文を入れる\n' : ''}
## ハッシュタグ
3グループに分けて計15個前後:
- ビッグタグ（#sdgs 等の大規模タグ）
- ミドルタグ（#ビーチクリーン 等のテーマタグ）
- 独自・大学タグ（#上智大学 ${i.account === 'travel' ? '#旅するgreen' : '#greensophia'} 等）

# 注意
- 1枚目は3秒で指を止めさせる。疑問形か意外な数字が有効
- 専門用語には必ず一言の補足を
- 誇張やエビデンスのない断定はしない`;
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
// ---------- 画像生成プロンプト（ChatGPT / Gemini 用） ----------
export type ImagePromptInput = {
  theme: string;
  detail: string;
  mood: string;      // 雰囲気キーワード（水彩風、パステル 等）
  slideRole: string;  // 表紙 / 中面 / まとめ 等
};

export function buildImagePrompt(i: ImagePromptInput): string {
  return `Instagram投稿用の画像を1枚生成してください。

【内容】
${i.theme}${i.detail ? `（${i.detail}）` : ''}をテーマにした、${i.slideRole || '投稿用'}の画像。

【雰囲気・スタイル】
${i.mood || 'やわらかい水彩・パステルカラー、手描き風のイラストテイスト'}。
説教くさくなく、親しみやすい印象。学生サークルらしい温かみのある表現。

【構図・技術指定】
- 正方形（1:1）またはInstagram縦長（4:5）に収まる構図
- 文字は入れず、イラスト・写真的な要素のみで構成
- 背景に強すぎるコントラストを避け、Canva上で文字を後から重ねられる余白を左右または上下に残す
- 色数は3〜4色程度に抑え、統一感のある配色にする

【避けたいこと】
- 過度にリアルで生々しい表現
- 特定の実在ブランドロゴや商標
- 文字・ロゴ・透かしの生成`;
}
// ---------- 分析プロンプト（アカウント対応版） ----------
export type AnalysisPromptInput = {
  account: 'main' | 'travel';
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
  const context = i.account === 'travel'
    ? `あなたはGreen Sophiaの姉妹アカウント「旅するGreen」（@tabisurugreen_insta）のSNS分析アシスタントです。
このアカウントは"クリーンから始まる繋がり"をコンセプトに、清掃活動をきっかけにその土地の文化・自然・観光の魅力を発信し、
「歩きたくなる町」を増やすことを目指しています。四ッ谷クリーン→東京クリーン→日本各地(Japan Clean Project)へと活動範囲を広げている段階です。`
    : `あなたは上智大学の環境活動サークル「Green Sophia」のSNS分析アシスタントです。
活動理念は"Learn with us, act with Green Sophia, inspire others."(共に学び、共に行動することで、誰かを刺激する)です。`;

  return `${context}

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
## 5. 来月の投稿ネタ 5案（1行ずつ。${i.account === 'travel' ? '訪問予定地や、その土地ならではの切り口を意識して' : 'サークルの活動テーマに沿って'}）

# 注意
- 学生が週数時間で運用している前提で、無理のない施策に
- 「バズらせる」より「${i.account === 'travel' ? 'その町に行ってみたいと思わせる、パートナー団体との縁につなげる' : '入会・イベント参加につなげる'}」ことを優先`;
}

// ---------- 企業リサーチプロンプト ----------
export type CompanyResearchInput = {
  industryHint: string;   // 業界・分野のヒント（省略可）
  budgetHint: string;     // 予算感・規模のヒント（省略可）
  goal: string;           // このコラボで達成したいこと
};

export function buildCompanyResearchPrompt(i: CompanyResearchInput): string {
  return `あなたはGreen Sophiaの渉外担当アシスタントです。Web検索を使って調査してください。

# サークルの基本情報
- 上智大学の環境活動サークル「Green Sophia」。部員約40名、Instagramフォロワー約1,800人
- 主な活動: ビーチクリーン、環境×アート、企業コラボ、学食コラボ、農業体験、フェアトレード勉強会
- 強み: 学生サークルとしては珍しく、Podcast・姉妹アカウント「旅するGreen」まで持つ発信力
- 過去の実績: SARAYA「緑の回廊プロジェクト」等とのコラボ経験あり

# 依頼
以下の条件に合う、コラボ・スポンサーの交渉に行けそうな企業を7〜10社リサーチし、リストアップしてください。

- 業界・分野のヒント: ${i.industryHint || '環境・サステナビリティに関連する事業を持つ企業全般'}
- 予算感・規模のヒント: ${i.budgetHint || '学生団体との協業実績がある、または相性が良さそうな中堅〜大手企業'}
- このコラボで達成したいこと: ${i.goal || '継続的なコラボ関係の構築'}

# 出力フォーマット
企業ごとに以下を整理してください。
- 企業名
- なぜGreen Sophiaと相性が良さそうか（1〜2文）
- 想定できるコラボの切り口（例: 商品コラボ、イベント共催、寄付・物品協賛 等）
- 学生団体との協業実績や、CSR・サステナビリティ活動の有無（分かれば）
- 交渉の入口になりそうな部署・窓口（分かれば。分からなければ一般的な問い合わせ先で可）

最後に、7〜10社の中で「特に交渉に行く価値が高い」と思う上位3社と、その理由を挙げてください。`;
}

// ---------- 企業への提案文プロンプト ----------
export type CompanyPitchInput = {
  companyName: string;
  companyContext: string; // その企業について分かっていること
  proposalIdea: string;   // 提案したいコラボ内容
  format: 'email' | 'onepager'; // メール文 or 提案資料の構成
};

export function buildCompanyPitchPrompt(i: CompanyPitchInput): string {
  const formatInstruction = i.format === 'email'
    ? '企業のご担当者様に送る、コラボ提案メールの文面を作成してください。件名も含めてください。'
    : '企業への提案資料（1枚もの / いわゆる One Pager）の構成案を、見出しと各項目の内容つきで作成してください。';

  return `あなたはGreen Sophiaの渉外担当アシスタントです。

# サークルの基本情報
- 上智大学の環境活動サークル「Green Sophia」。部員約40名、Instagramフォロワー約1,800人
- 主な活動: ビーチクリーン、環境×アート、企業コラボ、学食コラボ、農業体験
- 強み: 学生サークルとしては珍しく、Podcast・姉妹アカウント「旅するGreen」まで持つ発信力
- 過去の実績: SARAYA「緑の回廊プロジェクト」等とのコラボ経験あり

# 今回の依頼
${formatInstruction}

- 相手企業: ${i.companyName}
- 企業について分かっていること: ${i.companyContext || '（特記なし）'}
- 提案したいコラボ内容: ${i.proposalIdea}

# 注意
- 学生団体らしい熱意は残しつつ、ビジネス文書として失礼のない丁寧さを保つ
- 相手企業にとっての具体的なメリット（発信力、若年層へのリーチ、CSR文脈など）を必ず盛り込む
- 誇張した実績や、確認の取れていない数字は書かない`;
}

// ---------- 活動告知文（メンバー向け／SNS向け／外部向け） ----------
export type AnnouncementInput = {
  eventName: string;
  datetime: string;
  place: string;
  detail: string;
  bringItems: string;   // 持ち物（メンバー向けに使用）
  audience: 'member' | 'sns' | 'external' | 'all';
  externalOrg: string;  // 外部向け：宛先団体名（省略可）
};

function memberAnnouncement(i: AnnouncementInput): string {
  return `# 依頼
これはGreen SophiaのLINEグループに送る、部員向けの活動連絡です。
簡潔で読み飛ばされない、箇条書き中心の連絡文を作ってください。挨拶は最小限、結論から書いてください。

# イベント情報
- イベント名: ${i.eventName}
- 日時: ${i.datetime}
- 場所: ${i.place}
- 内容: ${i.detail || '（特記なし）'}
- 持ち物: ${i.bringItems || '（特になし）'}

# 出力形式
- 1行目：イベント名と日時が一目でわかるタイトル
- 箇条書きで「日時・集合場所・持ち物・注意事項」
- 最後に「参加できる人はスタンプで教えてください」のような一言
- 絵文字は見出し程度に少量`;
}

function snsAnnouncement(i: AnnouncementInput): string {
  return `# 依頼
これはInstagramに投稿する、イベント直前の告知文です。
外部の人が読んでも魅力が伝わるよう、期待感を持たせる文章にしてください。堅苦しくならないこと。

# イベント情報
- イベント名: ${i.eventName}
- 日時: ${i.datetime}
- 場所: ${i.place}
- 内容: ${i.detail || '（特記なし）'}

# 出力形式
## キャプション（200〜300字、絵文字を交え読みやすく）
## ストーリーズ用の短文（1〜2行、リンクへの誘導つき）
## ハッシュタグ（10個程度）`;
}

function externalAnnouncement(i: AnnouncementInput): string {
  return `# 依頼
これは${i.externalOrg ? `${i.externalOrg}様` : '外部の関係者・団体'}に送る、活動案内のメール文面です。
学生団体らしい丁寧さと熱意を保ちながら、ビジネスメールとして失礼のない文章にしてください。

# イベント情報
- イベント名: ${i.eventName}
- 日時: ${i.datetime}
- 場所: ${i.place}
- 内容: ${i.detail || '（特記なし）'}

# 出力形式
件名も含めたメール文面を作成してください。
- 挨拶
- 開催概要（日時・場所・内容）
- 参加や見学を歓迎する旨
- 問い合わせ先を書く一文（「本メールにご返信ください」等）
- 結びの挨拶`;
}

export function buildAnnouncementPrompt(i: AnnouncementInput): string {
  if (i.audience === 'member') return memberAnnouncement(i);
  if (i.audience === 'sns') return snsAnnouncement(i);
  if (i.audience === 'external') return externalAnnouncement(i);
  // 'all'：3つまとめて1つのプロンプトで依頼する
  return `以下のイベントについて、3種類の告知文を1度に作成してください。

# イベント情報
- イベント名: ${i.eventName}
- 日時: ${i.datetime}
- 場所: ${i.place}
- 内容: ${i.detail || '（特記なし）'}
- 持ち物: ${i.bringItems || '（特になし）'}

---

## ① メンバー向け（LINEグループ連絡）
簡潔で読み飛ばされない箇条書き中心。結論から。「日時・集合場所・持ち物・注意事項」を箇条書きで。

## ② SNS向け（Instagram告知）
外部の人が読んでも魅力が伝わる、期待感のある文章。キャプション（200〜300字）＋ストーリーズ用短文＋ハッシュタグ10個。

## ③ 外部向け（案内メール）
丁寧で失礼のないメール文面。件名つき。開催概要、参加・見学歓迎の旨、問い合わせ先を含める。`;
}

// ---------- 議事録作成（自由議題対応） ----------
export type AgendaItem = {
  topic: string;      // 議題（自由記述）
  rawNotes: string;   // 話した内容のざっくりメモ
  decision: string;   // 決定事項（決まらなければ「保留」等）
  owner: string;      // 担当者
  deadline: string;   // 期限
};

export type MeetingInput = {
  meetingName: string;   // 会議名（自由記述：幹部会、旅するGreenMTG 等）
  date: string;
  attendees: string;
  absentees: string;
  items: AgendaItem[];
};

export function buildMeetingPrompt(i: MeetingInput): string {
  const itemsBlock = i.items
    .map((it, idx) => `
### 議題${idx + 1}：${it.topic || '（未記入）'}
- 話した内容（メモ）：${it.rawNotes || '（未記入）'}
- 決定事項：${it.decision || '（未記入・保留の場合はその旨）'}
- 担当者：${it.owner || '（未記入）'}
- 期限：${it.deadline || '（未記入）'}`)
    .join('\n');

  return `# あなたの役割
あなたはGreen Sophiaの会議の議事録をまとめるアシスタントです。

# 会議情報
- 会議名: ${i.meetingName || '（未記入）'}
- 日時: ${i.date || '（未記入）'}
- 出席者: ${i.attendees || '（未記入）'}
- 欠席者: ${i.absentees || 'なし'}

# 各議題のメモ（そのまま貼っています）
${itemsBlock}

# 依頼
上のメモをもとに、以下の構成で正式な議事録に整形してください。
メモの言葉が足りない箇所は、文脈から自然な日本語に整えてよいですが、
書かれていない決定事項やタスクを勝手に作らないでください（不明な場合は「要確認」と書く）。

# 出力フォーマット
## 会議概要
（会議名・日時・出席者・欠席者を1〜2行で）

## 決定事項サマリー
（今回決まったことだけを、箇条書きで一覧化。議題をまたいでも良いので全体をざっと見て分かるように）

## タスク一覧
（表形式で：担当者｜内容｜期限。担当者ごとにグルーピングしても良い）

## 議題ごとの詳細
（議題1つずつ、話した内容の要約と決定事項を簡潔に）

## 次回への持ち越し・未決事項
（保留になったこと、次回いつまでに誰が判断するか）

# 注意
- 「〜だと思う」のような曖昧な決定は、決定事項に含めず「議論」として扱う
- タスクは必ず担当者名を明記する。担当者が不明なものは「担当者未定」と明記し、放置しない`;
}

// ---------- 活動前プランナー（企画アイデア＋撮影リスト） ----------
export type PrepPlanInput = {
  account: 'main' | 'travel';
  activityIdea: string;   // 予定している活動（未定なら空欄でOK）
  date: string;           // 実施予定日（分かれば。季節感の判断に使う）
  useWebSearch: boolean;  // 今の時期のイベント・トレンドを調べさせるか
};

export function buildPrepPlanPrompt(i: PrepPlanInput): string {
  const context = i.account === 'travel'
    ? 'Green Sophiaの姉妹アカウント「旅するGreen」（清掃活動をきっかけに、その土地の魅力を発信するアカウント）'
    : '上智大学の環境活動サークル「Green Sophia」';

  const searchBlock = i.useWebSearch
    ? `\n# 調べてほしいこと\nWeb検索を使って、実施予定時期（${i.date || '近い将来'}）に関連する季節のイベント・話題・トレンドを調べてください。
（例: この時期の環境系の記念日、地域のお祭り、SNSで話題の環境トピックなど）\nそれらを踏まえて企画案を考えてください。\n`
    : '';

  const themeBlock = i.activityIdea
    ? `- 予定している活動: ${i.activityIdea}`
    : '- 予定している活動: 未定（この時期にできそうな活動から提案してほしい）';

  return `# あなたの役割
あなたは${context}の、活動企画・撮影プランナーです。
「活動が終わってから投稿ネタに困る」「撮ればよかった写真を撮り忘れる」を防ぐのが目的です。
${searchBlock}
# 今回の相談内容
${themeBlock}
- 実施予定日: ${i.date || '未定'}

# 依頼したいこと
以下の3つを提案してください。

## 1. 企画アイデア
${i.activityIdea ? '入力した活動を、より発信につながる形にするための工夫を2〜3個' : '今の時期にできそうな活動アイデアを3つ（環境活動として実現可能な範囲で）'}

## 2. 撮っておくべき写真・動画リスト（撮影チェックリスト）
活動が終わった後に「あれを撮っておけばよかった」とならないよう、具体的なショットを7〜10個リストアップしてください。
- 【いつ撮るか】（活動前・活動中・活動後）
- 【何を撮るか】（できるだけ具体的に。例:「軍手をつける手元」「集めたゴミを並べた俯瞰」等）
- 【なぜ必要か】（表紙用／過程が伝わる／ビフォーアフター比較用 など、投稿での使い道）

## 3. 準備しておくべき素材・小道具
撮影や発信のために、当日までに用意しておくと良いもの（例: メジャー、ゴミ袋の色を揃える、看板や横断幕 等）

# 注意
- 実際に学生団体が無理なく準備できる範囲の提案にする
- 誇張せず、実現可能性を優先する`;
}
