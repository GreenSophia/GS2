import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// ============================================================
// LINE Bot Webhook
// - 画像を送る                    → Storageに保存して「参考デザイン」棚へ
// - 「スポンサー <URL> メモ」       → 「スポンサー候補」棚へ
// - 「デザイン <URL> メモ」        → 「参考デザイン」棚へ
// - 「メモしてください <本文>」     → 「ひらめきメモ」棚へ
// - それ以外の普通の会話           → 無視（記録しない・返信しない）
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
// 「メモして」「メモしてください」「メモ:」など、メモの合言葉を幅広く拾う
const MEMO_TRIGGER_RE = /^(メモして(ください)?|メモ[:：]?)\s*/i;

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
          if (upErr) console.error('STORAGE_UPLOAD_ERROR:', JSON.stringify(upErr));
        if (!upErr) {
          await supabase.from('stocks').insert({
            type: 'design',
            image_path: path,
            sent_by: sentBy,
          });
          await lineReply(event.replyToken, '参考デザインとして記録しました。アプリの「記録」で確認できます。');
        } else {
          await lineReply(event.replyToken, '画像の保存に失敗しました。もう一度送ってください。');
        }
      }
      continue;
    }

    // ---------- テキスト ----------
    if (msg.type === 'text') {
      const text: string = msg.text.trim();
      const urlMatch = text.match(URL_RE);
      const url = urlMatch ? urlMatch[1] : null;

      // ① スポンサー／デザイン の合言葉
      if (/^(スポンサー|すぽんさー|sp)/i.test(text)) {
        const note = text.replace(/^(スポンサー|すぽんさー|sp)\s*/i, '').replace(URL_RE, '').trim() || null;
        await supabase.from('stocks').insert({ type: 'sponsor', url, note, sent_by: sentBy });
        await lineReply(event.replyToken, '「スポンサー候補」に記録しました。');
        continue;
      }
      if (/^(デザイン|でざいん|design)/i.test(text)) {
        const note = text.replace(/^(デザイン|でざいん|design)\s*/i, '').replace(URL_RE, '').trim() || null;
        await supabase.from('stocks').insert({ type: 'design', url, note, sent_by: sentBy });
        await lineReply(event.replyToken, '「参考デザイン」に記録しました。');
        continue;
      }

      // ② 「メモしてください」の合言葉があるときだけ記録
      if (MEMO_TRIGGER_RE.test(text)) {
        const note = text.replace(MEMO_TRIGGER_RE, '').replace(URL_RE, '').trim() || null;
        await supabase.from('stocks').insert({ type: 'inbox', url, note, sent_by: sentBy });
        await lineReply(event.replyToken, '「ひらめきメモ」に記録しました。');
        continue;
      }

      // ③ それ以外の普通の会話は無視（記録もせず、返信もしない）
      continue;
    }
  }

  return NextResponse.json({ ok: true });
}

// LINEの疎通確認(Verify)用
export async function GET() {
  return NextResponse.json({ status: 'Green Sophia LINE webhook is alive' });
}
