import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { buildMediaKitText } from '@/lib/prompts';
import CopyButton from './copy-button';
import AnalysisForm from './analysis-form';

export const dynamic = 'force-dynamic';

async function saveMetric(formData: FormData) {
  'use server';
  const monthInput = String(formData.get('month') || '');
  const account = String(formData.get('account') || 'main');
  if (!monthInput) return;
  const num = (k: string) => {
    const v = String(formData.get(k) || '').replace(/[,，]/g, '').trim();
    return v ? Number(v) : null;
  };
  const txt = (k: string) => {
    const v = String(formData.get(k) || '').trim();
    return v || null;
  };
  await db()
    .from('monthly_metrics')
    .upsert(
      {
        month: `${monthInput}-01`,
        account,
        followers: num('followers'),
        reach: num('reach'),
        profile_views: num('profile_views'),
        posts_count: num('posts_count'),
        impressions: num('impressions'),
        post_views: num('post_views'),
        story_views: num('story_views'),
        reel_views: num('reel_views'),
        top5_views: txt('top5_views'),
        top5_likes: txt('top5_likes'),
        best_post: txt('best_post'),
        note: txt('note'),
      },
      { onConflict: 'month,account' }
    );
  revalidatePath('/metrics');
}

async function deleteMetric(formData: FormData) {
  'use server';
  await db().from('monthly_metrics').delete().eq('id', String(formData.get('id')));
  revalidatePath('/metrics');
}

export default async function MetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const { account: accountParam } = await searchParams;
  const account = accountParam === 'travel' ? 'travel' : 'main';

  const { data: rows } = await db()
    .from('monthly_metrics')
    .select('*')
    .eq('account', account)
    .order('month', { ascending: false });

  const mediaKit = rows?.length ? buildMediaKitText(rows as any) : '';
  const fmt = (n: number | null) => (n == null ? '—' : n.toLocaleString('ja-JP'));

  return (
    <main className="container">
      <section className="masthead">
        <div className="eyebrow">03　INSPIRE — 実績</div>
        <h1>実績</h1>
        <p className="lede">
          月次の数字を記録し、分析プロンプトの作成やメディアキットの出力までをまとめて行います。
        </p>
      </section>

      <div className="card">
        <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, marginBottom: 8 }}>
          どちらのアカウント？
        </label>
        <div className="chips">
          <a href="/metrics?account=main" className={`chip ${account === 'main' ? 'on' : ''}`}>Green Sophia</a>
          <a href="/metrics?account=travel" className={`chip ${account === 'travel' ? 'on' : ''}`}>旅するGreen</a>
        </div>
      </div>

      <nav className="subnav" aria-label="実績内メニュー">
        <a href="#record" className="active">数字を記録</a>
        <a href="#analysis">分析プロンプト</a>
        <a href="#history">推移・メディアキット</a>
      </nav>

      <div id="record" className="card tint-green">
        <h2>今月の数字を記録する</h2>
        <form action={saveMetric}>
          <input type="hidden" name="account" value={account} />
          <div className="field" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
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

          <h3 style={{ marginTop: 20 }}>コンテンツ閲覧数（直近1ヶ月）</h3>
          <div className="field" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label>コンテンツ閲覧数合計</label>
              <input type="text" name="impressions" placeholder="45000" inputMode="numeric" />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>投稿の閲覧</label>
              <input type="text" name="post_views" inputMode="numeric" />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>ストーリーズの閲覧</label>
              <input type="text" name="story_views" inputMode="numeric" />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>リールの閲覧</label>
              <input type="text" name="reel_views" inputMode="numeric" />
            </div>
          </div>

          <div className="field">
            <label>コンテンツ閲覧数トップ5 <span className="hint">カンマ区切りで5件</span></label>
            <textarea name="top5_views" placeholder="例: ガムはプラスチック製!?コラム, 野鳥観察会, ビーチクリーン告知, 学食コラボ, 環境×アート" />
          </div>
          <div className="field">
            <label>コンテンツ別いいねトップ5 <span className="hint">カンマ区切りで5件</span></label>
            <textarea name="top5_likes" placeholder="例: ガムはプラスチック製!?コラム, ビーチクリーン告知, 野鳥観察会, 学食コラボ, 環境×アート" />
          </div>

          <div className="field">
            <label>いちばん伸びた投稿 <span className="hint">省略可</span></label>
            <input type="text" name="best_post" placeholder="例: ガムはプラスチック製!?コラム（保存120）" />
          </div>
          <div className="field">
            <label>メモ <span className="hint">省略可</span></label>
            <input type="text" name="note" placeholder="例: 新歓期でフォロワー増。リール強化月間だった" />
          </div>
          <button className="btn btn-primary" type="submit">この月を記録する</button>
          <p className="muted" style={{ marginTop: 8, fontSize: '.78rem' }}>
            同じ月・同じアカウントをもう一度記録すると上書きされます
          </p>
        </form>
      </div>

      <div id="analysis" className="divider-leaf"><span>分析プロンプト</span></div>
      <AnalysisForm account={account} />

      <div id="history" className="divider-leaf"><span>これまでの推移</span></div>
      <div className="card">
        {!rows?.length ? (
          <div className="empty">まだ記録がありません。上のフォームから最初のひと月を記録してください。</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>月</th><th>フォロワー</th><th>リーチ</th><th>閲覧数合計</th><th>投稿/ストーリーズ/リール</th><th></th>
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
                      <td>{fmt(r.impressions)}</td>
                      <td>{fmt(r.post_views)} / {fmt(r.story_views)} / {fmt(r.reel_views)}</td>
                      <td>
                        <form action={deleteMetric}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className="btn btn-ghost btn-sm" type="submit">削除</button>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>メディアキット用テキスト</h2>
            <CopyButton text={mediaKit} />
          </div>
          <div className="prompt-out">{mediaKit}</div>
        </div>
      )}
    </main>
  );
}
