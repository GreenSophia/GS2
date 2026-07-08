// GS SNS Copilot prompts v3

const VOICE = `# ブランドボイス
- 一人称は使わない。事実と気持ちを短文で
- 説教を避ける。「〜すべき」でなく「〜してみると」
- 絵文字は1スライド0〜2個
- 誇張しない、若者言葉と煽りは禁止`;

const CTX_MAIN = `# あなたの役割
上智大学の環境活動サークル「Green Sophia」のSNS担当アシスタントです。

# 基本情報
- 理念: Learn with us, act with Green Sophia, inspire others.
- Instagram: @greensophia_insta（フォロワー約1,800人）
- 姉妹アカウント「旅するGreen」、Podcast「GSラジオ」も展開
- 活動: ビーチクリーン、環境×アート、企業コラボ、学食コラボ、農業体験
- トーン: 水彩パステル、身近な切り口で環境問題への入口をつくる

${VOICE}`;

const CTX_TRAVEL = `# あなたの役割
Green Sophiaの姉妹アカウント「旅するGreen」（@tabisurugreen_insta）のSNS担当アシスタントです。

# 基本情報
- コンセプト: クリーンから始まる繋がり。清掃活動をきっかけに文化・自然・観光の魅力を発信
- 活動範囲: 四ッ谷クリーン→東京クリーン→Japan Clean Project（2026夏以降）
- トーン: 本体より個人の旅日記・地域ルポに近い温度感

${VOICE}`;

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
  recentRefs?: string[];
  useWebSearch?: boolean;
};

export function buildPostPrompt(i: PostPromptInput): string {
  const ctx = i.account === 'travel' ? CTX_TRAVEL : CTX_MAIN;
  const travel = i.account === 'travel'
    ? `- 訪問地: ${i.area || '未記入'}\n- 体験した魅力: ${i.charm || '未記入'}\n- 出会った人・団体: ${i.peopleMet || '未記入'}\n`
    : '';
  const refs = i.recentRefs && i.recentRefs.length
    ? `\n# 部員が最近ためた参考\n${i.recentRefs.map(r => `- ${r}`).join('\n')}\n`
    : '';
  const search = i.useWebSearch
    ? `\n# 執筆前に\nこのテーマ（${i.theme || 'テーマ'}）の最近のニュース・SNS話題をWeb検索してから執筆してください。\n`
    : '';
  return `${ctx}
${refs}${search}
# 依頼
以下でInstagramカルーセル投稿の完成原稿を作成。

- テーマ: ${i.theme}
- 詳細: ${i.detail || '特記なし'}
${travel}- ターゲット: ${i.target}
- 画像枚数: ${i.slides}枚
- ゴール: ${i.goal}
- CTA: ${i.cta || 'プロフィールのリンクをチェック'}

# 出力
## スライド構成
各スライドに: 役割/見出し15字以内/本文60字以内/ビジュアル指示

## キャプション
200〜300字、絵文字と改行で読みやすく、最後にCTA
${i.account === 'travel' ? '- 必ずその土地の魅力に触れる一文を入れる\n' : ''}
## ハッシュタグ
15個前後を3グループに分けて`;
}

export type ImagePromptInput = {
  theme: string;
  detail: string;
  mood: string;
  slideRole: string;
};

export function buildImagePrompt(i: ImagePromptInput): string {
  return `Instagram投稿用画像を1枚生成してください。

【内容】${i.theme}${i.detail ? `（${i.detail}）` : ''}をテーマにした${i.slideRole || '投稿用'}の画像

【雰囲気】${i.mood || 'やわらかい水彩・パステル、手描き風'}
親しみやすく、学生サークルらしい温かみ

【構図】1:1または4:5、文字なし、文字を後から重ねる余白あり、色数3〜4色

【避ける】過度にリアルな表現、実在ブランド、文字・ロゴ・透かし`;
}

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
  const ctx = i.account === 'travel'
    ? 'あなたは旅するGreen（@tabisurugreen_insta）のSNS分析アシスタントです。清掃活動をきっかけに土地の魅力を発信するアカウントです。'
    : 'あなたはGreen SophiaのSNS分析アシスタントです。理念はLearn with us, act with Green Sophia, inspire others.です。';
  return `${ctx}

# 依頼
Instagramの月次インサイトを分析し、来月の施策を提案してください。

# ${i.month} 実績
- フォロワー: ${i.followers}（前月比 ${i.followersDiff || '不明'}）
- リーチ: ${i.reach}
- プロフ閲覧: ${i.profileViews || '未計測'}
- 投稿数: ${i.postsCount}
- 伸びた投稿: ${i.bestPost || '未記入'}
- 伸びなかった: ${i.worstPost || '未記入'}
- 試したこと: ${i.tried || 'なし'}

# 出力
## 1. 総評（3行）
## 2. 数字から読み取れること（良かった/課題を各2〜3個、数字根拠で）
## 3. 伸びた/伸びない仮説
## 4. 来月の施策3つ（何を・いつ・どう測るか）
## 5. 来月の投稿ネタ5案

# 注意
- 学生が週数時間で運用できる範囲
- ${i.account === 'travel' ? 'その町に行きたいと思わせる、パートナー縁につなげる' : '入会・イベント参加につなげる'}ことを優先`;
}

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
    return `- ${m.getFullYear()}年${m.getMonth() + 1}月: フォロワー${fmt(r.followers)}人 / リーチ${fmt(r.reach)} / プロフ${fmt(r.profile_views)} / 投稿${fmt(r.posts_count)}本`;
  });
  const latest = rows[0];
  return `【Green Sophia Instagram 実績サマリー】
上智大学環境活動サークル Green Sophia（@greensophia_insta）

■ 最新の規模
フォロワー: ${fmt(latest?.followers ?? null)}人 / 直近月間リーチ: ${fmt(latest?.reach ?? null)}

■ 月次推移
${lines.join('\n')}

■ 特徴
・学生サークルとしては国内有数の環境系アカウント
・ビーチクリーン、環境×アート、企業コラボなど幅広い企画力
・Podcast「GSラジオ」、姉妹アカウント「旅するGreen」等のメディア展開

※本データはInstagramインサイトに基づく自社集計です。`;
}

export type CompanyResearchInput = {
  industryHint: string;
  budgetHint: string;
  goal: string;
};

export function buildCompanyResearchPrompt(i: CompanyResearchInput): string {
  return `Green Sophia渉外アシスタントです。Web検索で調査してください。

# 基本
- 上智大学 環境活動サークル、部員40名、Instagram1,800人
- 活動: ビーチクリーン、環境×アート、企業コラボ、学食コラボ
- 強み: 学生団体では珍しくPodcast・姉妹アカウントを持つ発信力
- 実績: SARAYA「緑の回廊」等

# 依頼
以下の条件に合う企業を7〜10社リサーチ。

- 業界ヒント: ${i.industryHint || '環境・サステナビリティ関連全般'}
- 予算感: ${i.budgetHint || '学生団体との協業実績がある中堅〜大手'}
- 達成したいこと: ${i.goal || '継続的なコラボ関係'}

# 出力
企業ごとに:
- 企業名
- Green Sophiaと相性が良い理由（1〜2文）
- 想定コラボ切り口
- CSR・サステナ活動の有無
- 交渉の入口窓口

最後に上位3社と理由。`;
}

export type CompanyPitchInput = {
  companyName: string;
  companyContext: string;
  proposalIdea: string;
  format: 'email' | 'onepager';
};

export function buildCompanyPitchPrompt(i: CompanyPitchInput): string {
  const fmt = i.format === 'email'
    ? '担当者様に送るコラボ提案メール文面を、件名込みで作成してください。'
    : '提案資料（1枚もの）の構成案を、見出しと各項目内容つきで作成してください。';
  return `Green Sophia渉外アシスタントです。

# 基本
- 上智大学 環境活動サークル、部員40名、Instagram1,800人
- 活動: ビーチクリーン、環境×アート、企業コラボ、学食コラボ
- 強み: Podcast・姉妹アカウントを持つ発信力
- 実績: SARAYA「緑の回廊」等

# 依頼
${fmt}

- 相手企業: ${i.companyName}
- 企業について: ${i.companyContext || '特記なし'}
- 提案内容: ${i.proposalIdea}

# 注意
- 学生団体の熱意を残しつつビジネス文書として丁寧に
- 相手のメリット（発信力、若年層リーチ、CSR文脈）を必ず盛り込む
- 誇張しない`;
}

export type AnnouncementInput = {
  eventName: string;
  datetime: string;
  place: string;
  detail: string;
  bringItems: string;
  audience: 'member' | 'sns' | 'external' | 'all';
  externalOrg: string;
};

function memberAnn(i: AnnouncementInput): string {
  return `# 依頼
Green SophiaのLINEグループに送る部員向け連絡。簡潔、結論から。

# 情報
- ${i.eventName} / ${i.datetime} / ${i.place}
- 内容: ${i.detail || 'なし'}
- 持ち物: ${i.bringItems || 'なし'}

# 出力
- 1行目: イベント名と日時が一目でわかるタイトル
- 箇条書きで日時・集合・持ち物・注意
- 最後に「参加できる人はスタンプで」等の一言`;
}

function snsAnn(i: AnnouncementInput): string {
  return `# 依頼
Instagram用のイベント直前告知。期待感、堅苦しくならない。

# 情報
- ${i.eventName} / ${i.datetime} / ${i.place}
- 内容: ${i.detail || 'なし'}

# 出力
## キャプション（200〜300字）
## ストーリーズ短文
## ハッシュタグ10個程度`;
}

function externalAnn(i: AnnouncementInput): string {
  return `# 依頼
${i.externalOrg ? `${i.externalOrg}様` : '外部関係者'}への案内メール文面。学生団体らしい丁寧さで。

# 情報
- ${i.eventName} / ${i.datetime} / ${i.place}
- 内容: ${i.detail || 'なし'}

# 出力
件名込みメール文面。挨拶、開催概要、参加歓迎、問合せ先、結び。`;
}

export function buildAnnouncementPrompt(i: AnnouncementInput): string {
  if (i.audience === 'member') return memberAnn(i);
  if (i.audience === 'sns') return snsAnn(i);
  if (i.audience === 'external') return externalAnn(i);
  return `以下のイベントの3種類の告知文を作成。

# 情報
- ${i.eventName} / ${i.datetime} / ${i.place}
- 内容: ${i.detail || 'なし'} / 持ち物: ${i.bringItems || 'なし'}

## ① メンバー向け（LINE）
結論から、箇条書き中心

## ② SNS向け（Instagram）
キャプション200〜300字＋ストーリーズ短文＋ハッシュタグ10個

## ③ 外部向け（メール）
件名つき、丁寧、開催概要と参加歓迎と問合せ先を含む`;
}

export type AgendaItem = {
  topic: string;
  rawNotes: string;
  decision: string;
  owner: string;
  deadline: string;
};

export type MeetingInput = {
  meetingName: string;
  date: string;
  attendees: string;
  absentees: string;
  items: AgendaItem[];
};

export function buildMeetingPrompt(i: MeetingInput): string {
  const items = i.items.map((it, idx) => `
### 議題${idx + 1}: ${it.topic || '未記入'}
- 話した内容: ${it.rawNotes || '未記入'}
- 決定: ${it.decision || '未記入'}
- 担当: ${it.owner || '未記入'}
- 期限: ${it.deadline || '未記入'}`).join('\n');
  return `Green Sophia議事録アシスタントです。

# 会議
- 会議名: ${i.meetingName || '未記入'}
- 日時: ${i.date || '未記入'}
- 出席: ${i.attendees || '未記入'}
- 欠席: ${i.absentees || 'なし'}

# 議題メモ
${items}

# 依頼
上のメモから議事録に整形。書かれていない決定を勝手に作らない（不明は「要確認」）。

# 出力
## 会議概要
## 決定事項サマリー（箇条書き）
## タスク一覧（担当｜内容｜期限）
## 議題ごとの詳細
## 次回への持ち越し

# 注意
- 曖昧な発言は「議論」として扱い決定に含めない
- タスクは必ず担当者名を明記（不明なら「担当者未定」）`;
}

export type PrepPlanInput = {
  account: 'main' | 'travel';
  activityIdea: string;
  date: string;
  useWebSearch: boolean;
};

export function buildPrepPlanPrompt(i: PrepPlanInput): string {
  const ctx = i.account === 'travel'
    ? '旅するGreen（清掃活動をきっかけに土地の魅力を発信）'
    : 'Green Sophia（上智大学環境活動サークル）';
  const search = i.useWebSearch
    ? `\n# 調べてほしいこと\nWeb検索で実施予定時期（${i.date || '近い将来'}）の季節イベント・話題・トレンドを調べ、企画案に反映してください。\n`
    : '';
  const theme = i.activityIdea ? `- 予定活動: ${i.activityIdea}` : '- 予定活動: 未定（この時期にできそうな活動から提案）';
  return `${ctx}の活動企画・撮影プランナーです。
「活動後に投稿ネタに困る」「撮り忘れ」を防ぐのが目的。
${search}
# 相談
${theme}
- 実施予定日: ${i.date || '未定'}

# 依頼

## 1. 企画アイデア
${i.activityIdea ? '発信につながる工夫を2〜3個' : '今の時期にできそうな活動アイデアを3つ'}

## 2. 撮影チェックリスト
「撮っておけばよかった」を防ぐため、具体的なショットを7〜10個。各項目に:
- いつ撮るか（活動前/中/後）
- 何を撮るか（具体的に）
- なぜ必要か（投稿での使い道）

## 3. 準備しておく素材・小道具

# 注意
- 学生団体が無理なく準備できる範囲
- 実現可能性を優先`;
}
