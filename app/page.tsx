import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = db();
  const [{ count: stockCount }, { data: recent }] = await Promise.all([
    supabase.from('stocks').select('*', { count: 'exact', head: true }),
    supabase.from('stocks').select('id, type, note, url, created_at').order('created_at', { ascending: false }).limit(3),
  ]);

  const typeLabel: Record<string, { cls: string; label: string }> = {
    design: { cls: 'tag-design', label: '参考デザイン' },
    sponsor: { cls: 'tag-sponsor', label: 'スポンサー候補' },
    inbox: { cls: 'tag-inbox', label: 'ひらめきメモ' },
  };

  return (
    <main className="container">
      <span className="eyebrow">Learn, act, inspire.</span>
      <h1>きょうも、だれかを刺激しよう 🌏</h1>
      <p className="muted">投稿づくりも、コラボ準備も、ここからはじめよう。</p>

      <div className="card-grid" style={{ marginTop: 18 }}>
        <a href="/stocks" style={{ textDecoration: 'none' }}>
          <div className="card tint-sky" style={{ height: '100%' }}>
            <span className="eyebrow">Learn</span>
            <h2>🌱 ためる</h2>
            <p className="muted">LINEで送ったスクショや記事のストック棚。いま <b>{stockCount ?? 0}</b> 件。</p>
          </div>
        </a>
        <a href="/prompts/post" style={{ textDecoration: 'none' }}>
          <div className="card tint-green" style={{ height: '100%' }}>
            <span className="eyebrow">Act</span>
            <h2>✍️ つくる</h2>
            <p className="muted">条件を選ぶだけで、Claudeに渡す投稿プロンプトが完成。</p>
          </div>
        </a>
        <a href="/metrics" style={{ textDecoration: 'none' }}>
          <div className="card tint-peach" style={{ height: '100%' }}>
            <span className="eyebrow">Inspire</span>
            <h2>📈 ひろげる</h2>
            <p className="muted">月次実績を記録して、コラボ提案用メディアキットに。</p>
          </div>
        </a>
      </div>

      <div className="divider-leaf">🌿 🌿 🌿</div>

      <div className="card">
        <h2>とどいたばかりのストック</h2>
        {!recent?.length ? (
          <div className="empty">
            まだ何もないよ。サークルのLINE Botにスクショや記事URLを送ると、ここに集まります 📮
          </div>
        ) : (
          recent.map((s) => {
            const t = typeLabel[s.type] ?? typeLabel.inbox;
            return (
              <div className="stock-item" key={s.id}>
                <div>
                  <span className={`tag ${t.cls}`}>{t.label}</span>
                  <p style={{ margin: '4px 0' }}>{s.note || s.url || '（メモなし）'}</p>
                  <span className="stock-meta">
                    {new Date(s.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div style={{ marginTop: 12 }}>
          <a href="/stocks" className="btn btn-sm">ぜんぶ見る →</a>
        </div>
      </div>
    </main>
  );
}
