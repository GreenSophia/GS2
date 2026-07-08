import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import PostForm from './post-form';
import CompanyForm from './company-form';
import AnnouncementForm from './announcement-form';
import MeetingForm from './meeting-form';

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
  revalidatePath('/prompts/post');
}

async function deleteTemplate(formData: FormData) {
  'use server';
  await db().from('canva_templates').delete().eq('id', String(formData.get('id')));
  revalidatePath('/prompts/post');
}

export default async function PostPromptPage() {
  const [{ data: templates }, { data: recentStocks }] = await Promise.all([
    db().from('canva_templates').select('*').order('category').order('created_at', { ascending: false }),
    db().from('stocks').select('note, url, type').eq('type', 'design').order('created_at', { ascending: false }).limit(5),
  ]);

  const grouped = CATEGORIES.map((c) => ({
    category: c,
    items: (templates ?? []).filter((t) => t.category === c),
  })).filter((g) => g.items.length > 0);

  const recentRefs = (recentStocks ?? [])
    .map((s) => s.note || s.url)
    .filter((v): v is string => !!v);

  return (
    <main className="container">
      <section className="masthead">
        <div className="eyebrow">02　ACT — 作成</div>
        <h1>作成</h1>
        <p className="lede">
          投稿・画像・Canvaテンプレの作成に加えて、イベント告知文・議事録・コラボ先企業のリサーチもここで作れます。
        </p>
      </section>

      <nav className="subnav" aria-label="作成内メニュー">
        <a href="#prompt" className="active">投稿プロンプト</a>
        <a href="#announce">告知文</a>
        <a href="#meeting">議事録</a>
        <a href="#canva">Canva棚</a>
        <a href="#company">企業リサーチ・提案</a>
      </nav>

      <div id="prompt">
        <PostForm recentRefs={recentRefs} />
      </div>

      <div className="divider-leaf" id="announce"><span>活動告知文</span></div>
      <AnnouncementForm />

      <div className="divider-leaf" id="meeting"><span>議事録</span></div>
      <MeetingForm />

      <div className="divider-leaf" id="canva"><span>Canva棚</span></div>

      <div className="card tint-green">
        <h3 style={{ marginBottom: 12 }}>使い方</h3>
        <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 2 }}>
          <li>普段サークルで使っているCanvaのテンプレートを、下のフォームから登録しておきます(最初に一度だけ)。</li>
          <li>投稿を作るときは、テンプレート名をクリックするとそのCanvaが開きます。</li>
          <li>上で作った文章・画像をCanvaに流し込み、写真を差し替えれば投稿が完成します。</li>
        </ol>
      </div>

      {!grouped.length ? (
        <div className="empty">
          まだテンプレートが登録されていません。下のフォームから、サークルのCanvaテンプレートを追加してください。
        </div>
      ) : (
        grouped.map((g) => (
          <div className="card" key={g.category}>
            <h2>{g.category}</h2>
            {g.items.map((t) => (
              <div className="stock-item" key={t.id}>
                <div style={{ flex: 1 }}>
                  <a href={t.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>
                    {t.title}
                  </a>
                  {t.memo && <p className="muted" style={{ margin: '4px 0 0' }}>{t.memo}</p>}
                </div>
                <form action={deleteTemplate}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="btn btn-ghost btn-sm" type="submit">削除</button>
                </form>
              </div>
            ))}
          </div>
        ))
      )}

      <div className="card tint-green">
        <h2>テンプレートを追加する</h2>
        <form action={addTemplate}>
          <div className="field">
            <label>名前</label>
            <input type="text" name="title" placeholder="例: ビーチクリーン告知（水彩ブルー）" required />
          </div>
          <div className="field" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
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
            <label>メモ <span className="hint">省略可</span></label>
            <input type="text" name="memo" placeholder="例: カルーセル6枚用。表紙の写真は差し替えて使う" />
          </div>
          <button className="btn btn-primary" type="submit">棚に追加する</button>
        </form>
      </div>

      <div className="divider-leaf" id="company"><span>企業リサーチ・提案</span></div>
      <CompanyForm />
    </main>
  );
}
