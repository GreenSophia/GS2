import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['イベント告知', '活動報告', '啓発コラム', 'コラボ', 'その他'] as const;

async function addTemplate(formData: FormData) {
  'use server';
  const title = String(formData.get('title') || '').trim();
  const url = String(formData.get('url') || '').trim();
  const category = String(formData.get('category') || 'その他');
  const memo = String(formData.get('memo') || '').trim();
  if (!title || !url) return;
  await db().from('canva_templates').insert({ title, url, category, memo: memo || null });
  revalidatePath('/portal');
}

async function deleteTemplate(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  await db().from('canva_templates').delete().eq('id', id);
  revalidatePath('/portal');
}

export default async function PortalPage() {
  const { data: templates } = await db()
    .from('canva_templates')
    .select('*')
    .order('category')
    .order('created_at', { ascending: false });

  const grouped = CATEGORIES.map((c) => ({
    category: c,
    items: (templates ?? []).filter((t) => t.category === c),
  })).filter((g) => g.items.length > 0);

  return (
    <main className="container">
      <span className="eyebrow">Our design shelf</span>
      <h1>🎨 Canva棚</h1>
      <p className="muted">
        <a href="/prompts/post">つくる</a>でできた原稿を、ここのテンプレに流し込んで完成させよう。
      </p>

      {!grouped.length ? (
        <div className="empty">
          まだテンプレが登録されてないよ。下のフォームから、サークルのCanvaテンプレURLを追加してね 🎨
        </div>
      ) : (
        grouped.map((g) => (
          <div className="card" key={g.category}>
            <h2>{g.category}</h2>
            {g.items.map((t) => (
              <div className="stock-item" key={t.id}>
                <div style={{ flex: 1 }}>
                  <a href={t.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>
                    {t.title} ↗
                  </a>
                  {t.memo && <p className="muted" style={{ margin: '2px 0 0' }}>{t.memo}</p>}
                </div>
                <form action={deleteTemplate}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="btn btn-sm" type="submit" aria-label={`${t.title}を削除`}>
                    削除
                  </button>
                </form>
              </div>
            ))}
          </div>
        ))
      )}

      <div className="card tint-green">
        <h2>テンプレを追加する</h2>
        <form action={addTemplate}>
          <div className="field">
            <label>名前</label>
            <input type="text" name="title" placeholder="例: ビーチクリーン告知（水彩ブルー）" required />
          </div>
          <div className="field" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 220 }}>
              <label>CanvaのURL</label>
              <input type="url" name="url" placeholder="https://www.canva.com/design/..." required />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label>カテゴリ</label>
              <select name="category">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>メモ <span className="hint">使いどころなど。省略OK</span></label>
            <input type="text" name="memo" placeholder="例: カルーセル6枚用。表紙の写真は差し替えて使う" />
          </div>
          <button className="btn btn-primary" type="submit">棚に追加する</button>
        </form>
      </div>
    </main>
  );
}
