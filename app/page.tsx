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
    inbox: { cls: 'tag-inbox', label: 'メモ' },
  };

  return (
    <main className="container">
      <section className="masthead">
        <div className="eyebrow">GREEN SOPHIA — SNS COPILOT</div>
        <h1 style={{ lineHeight: 1.28 }}>
          Learn with us,<br />
          act with Green Sophia,<br />
          inspire others.
        </h1>
        <p className="lede">
          
          共に学び、共に行動することで、誰かを刺激する。
          
        </p>
      </section>

      <div className="card-grid">
        <a href="/stocks">
          <div className="card">
            <div className="eyebrow">01　LEARN</div>
            <h2>保存リスト</h2>
            <p className="muted" style={{ marginTop: 10 }}>
              LINEに送った参考スクリーンショットや記事を蓄積する。
              <br /><span style={{ fontSize: '.82rem' }}>現在 {stockCount ?? 0} 件</span>
            </p>
          </div>
        </a>
        <a href="/prompts/post">
          <div className="card">
            <div className="eyebrow">02　ACT</div>
            <h2>制作</h2>
            <p className="muted" style={{ marginTop: 10 }}>
            条件を選ぶだけで、投稿文・画像・Canvaテンプレをまとめて用意。
            </p>
          </div>
        </a>
        <a href="/metrics">
          <div className="card">
            <div className="eyebrow">03　INSPIRE</div>
            <h2>PR</h2>
            <p className="muted" style={{ marginTop: 10 }}>
              月次実績を記録し、分析や資料出力までをまとめて行う。
            </p>
          </div>
        </a>
      </div>

      <div className="divider-leaf"><span>最近の収集</span></div>

      <div className="card">
        {!recent?.length ? (
          <div className="empty">
            まだ記録がありません。サークルのLINE Botにスクリーンショットや記事URLを送ると、ここに集まります。
          </div>
        ) : (
          recent.map((s) => {
            const t = typeLabel[s.type] ?? typeLabel.inbox;
            return (
              <div className="stock-item" key={s.id}>
                <div>
                  <span className={`tag ${t.cls}`}>{t.label}</span>
                  <p style={{ margin: '10px 0 4px' }}>{s.note || s.url || '（メモなし）'}</p>
                  <span className="stock-meta">
                    {new Date(s.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div style={{ marginTop: 18 }}>
          <a href="/stocks" className="btn btn-sm">すべて見る</a>
        </div>
      </div>
    </main>
  );
}
