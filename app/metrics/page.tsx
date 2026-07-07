import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { buildMediaKitText } from '@/lib/prompts';
import CopyButton from './copy-button';

export const dynamic = 'force-dynamic';

async function saveMetric(formData: FormData) {
  'use server';
  const monthInput = String(formData.get('month') || ''); // "2026-07"
  if (!monthInput) return;
  const num = (k: string) => {
    const v = String(formData.get(k) || '').replace(/[,，]/g, '').trim();
    return v ? Number(v) : null;
  };
  await db()
    .from('monthly_metrics')
    .upsert(
      {
        month: `${monthInput}-01`,
        followers: num('followers'),
        reach: num('reach'),
        profile_views: num('profile_views'),
        posts_count: num('posts_count'),
        best_post: String(formData.get('best_post') || '').trim() || null,
        note: String(formData.get('note') || '').trim() || null,
      },
      { onConflict: 'month' }
    );
  revalidatePath('/metrics');
}

async function deleteMetric(formData: FormData) {
  'use server';
  await db().from('monthly_metrics').delete().eq('id', String(formData.get('id')));
  revalidatePath('/metrics');
}

export default async function MetricsPage() {
  const { data: rows } = await db()
    .from('monthly_metrics')
    .select('*')
    .order('month', { ascending: false });

  const mediaKit = rows?.length ? buildMediaKitText(rows as any) : '';
  const fmt = (n: number | null) => (n == null ? '—' : n.toLocaleString('ja-JP'));

  return (
    <main className="container">
      <span className="eyebrow">Inspire others</span>
      <h1>📈 ひろげる（実績ノート）</h1>
      <p className="muted">
        月に一度、インサイトの数字をここに写しておこう。企業コラボの提案時に「メディアキット」として一瞬で出せるようになるよ。
      </p>

      <div className="card tint-peach">
        <h2>今月の数字を記録する</h2>
        <form action={saveMetric}>
          <div className="field" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 160px' }}>
              <label>月</label>
              <input type="month" name="month" required />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>フォロワー</label>
              <input type="text" name="followers" placeholder="1790" inputMode="numeric" />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>リーチ</label>
              <input type="text" name="reach" placeholder="18000" inputMode="numeric" />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>プロフ閲覧</label>
              <input type="text" name="profile_views" inputMode="numeric" />
            </div>
            <div style={{ flex: 1, minWidth: 100 }}>
              <label>投稿数</label>
              <input type="text" name="posts_count" inputMode="numeric" />
            </div>
          </div>
          <div className="field">
            <label>いちばん伸びた投稿 <span className="hint">省略OK</span></label>
            <input type="text" name="best_post" placeholder="例: ガムはプラスチック製!?コラム（保存120）" />
          </div>
          <div className="field">
            <label>メモ <span className="hint">省略OK</span></label>
            <input type="text" name="note" placeholder="例: 新歓期でフォロワー増。リール強化月間だった" />
          </div>
          <button className="btn btn-primary" type="submit">この月を記録する</button>
          <p className="muted" style={{ marginTop: 8, fontSize: '.78rem' }}>
            同じ月をもう一度記録すると上書きされます
          </p>
        </form>
      </div>

      <div className="card">
        <h2>これまでの歩み</h2>
        {!rows?.length ? (
          <div className="empty">まだ記録がないよ。最初のひと月を書き込もう ✏️</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>月</th><th>フォロワー</th><th>リーチ</th><th>プロフ閲覧</th><th>投稿数</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const d = new Date(r.month + 'T00:00:00');
                  return (
                    <tr key={r.id}>
                      <td>{d.getFullYear()}年{d.getMonth() + 1}月</td>
                      <td>{fmt(r.followers)}</td>
                      <td>{fmt(r.reach)}</td>
                      <td>{fmt(r.profile_views)}</td>
                      <td>{fmt(r.posts_count)}</td>
                      <td>
                        <form action={deleteMetric}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className="btn btn-sm" type="submit">削除</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mediaKit && (
        <div className="card tint-green">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ margin: 0 }}>メディアキット用テキスト</h2>
            <CopyButton text={mediaKit} />
          </div>
          <div className="prompt-out">{mediaKit}</div>
        </div>
      )}
    </main>
  );
}
