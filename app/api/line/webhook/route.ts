import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// ============================================================
// LINE Bot Webhook
// - 画像を送る          → Storageに保存して「参考デザイン」棚へ
// - 「スポンサー <URL> メモ」 → 「スポンサー候補」棚へ
// - 「デザイン <URL> メモ」  → 「参考デザイン」棚へ
// - それ以外のテキスト   → 「ひらめきメモ」棚へ
// Make/Zapierは不要。LINE → このルート → Supabase の直結構成。
// ============================================================

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const hash = crypto
    .createHmac('sha256', process.env.LINE_CHANNEL_SECRET!)
    .update(rawBody)
    .digest('base64');
  return hash === signature;
}

async function lineReply(replyToken: string, text: string) {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages: [{ type: 'text', text }] }),
  });
}

async function getDisplayName(userId: string | undefined): Promise<string | null> {
  if (!userId) return null;
  try {
    const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
    });
    if (!res.ok) return null;
    const p = await res.json();
    return p.displayName ?? null;
  } catch {
    return null;
  }
}

const URL_RE = /(https?:\/\/[^\s]+)/;

export async function POST(req: Request) {
  const rawBody = await req.text();
  if (!verifySignature(rawBody, req.headers.get('x-line-signature'))) {
    return NextResponse.json({ error: 'bad signature' }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const supabase = db();

  for (const event of body.events ?? []) {
    if (event.type !== 'message') continue;
    const msg = event.message;
    const sentBy = await getDisplayName(event.source?.userId);

    // ---------- 画像 → 参考デザイン ----------
    if (msg.type === 'image') {
      const contentRes = await fetch(
        `https://api-data.line.me/v2/bot/message/${msg.id}/content`,
        { headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` } }
      );
      if (contentRes.ok) {
        const buf = Buffer.from(await contentRes.arrayBuffer());
        const contentType = contentRes.headers.get('content-type') ?? 'image/jpeg';
        const ext = contentType.includes('png') ? 'png' : 'jpg';
        const path = `${Date.now()}-${msg.id}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from('stocks')
          .upload(path, buf, { contentType });

        if (!upErr) {
          await supabase.from('stocks').insert({
            type: 'design',
            image_path: path,
            sent_by: sentBy,
          });
          await lineReply(event.replyToken, '参考デザインとして棚に入れたよ 🖼✨\nアプリの「🌱ためる」で見られます');
        } else {
          await lineReply(event.replyToken, '保存に失敗しちゃった…もう一度送ってみて 🙏');
        }
      }
      continue;
    }

    // ---------- テキスト ----------
    if (msg.type === 'text') {
      const text: string = msg.text.trim();
      const urlMatch = text.match(URL_RE);
      const url = urlMatch ? urlMatch[1] : null;

      let type: 'design' | 'sponsor' | 'inbox' = 'inbox';
      if (/^(スポンサー|すぽんさー|sp)/i.test(text)) type = 'sponsor';
      else if (/^(デザイン|でざいん|design)/i.test(text)) type = 'design';

      // 先頭のコマンド語とURLを除いた残りをメモとして保存
      const note =
        text
          .replace(/^(スポンサー|すぽんさー|sp|デザイン|でざいん|design)\s*/i, '')
          .replace(URL_RE, '')
          .trim() || null;

      await supabase.from('stocks').insert({ type, url, note, sent_by: sentBy });

      const shelf =
        type === 'sponsor' ? 'スポンサー候補 🤝' : type === 'design' ? '参考デザイン 🖼' : 'ひらめきメモ 💡';
      await lineReply(
        event.replyToken,
        `「${shelf}」の棚に入れたよ！\n${type === 'inbox' && url ? 'ヒント:「スポンサー」か「デザイン」を頭につけると自動で仕分けされるよ' : 'ナイス収集 ✨'}`
      );
    }
  }

  return NextResponse.json({ ok: true });
}

// LINEの疎通確認(Verify)用
export async function GET() {
  return NextResponse.json({ status: 'Green Sophia LINE webhook is alive 🌿' });
}
