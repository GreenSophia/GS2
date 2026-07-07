'use client';
import { useMemo, useState } from 'react';
import { buildAnalysisPrompt } from '@/lib/prompts';

export default function AnalysisPromptPage() {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [month, setMonth] = useState(defaultMonth);
  const [followers, setFollowers] = useState('');
  const [followersDiff, setFollowersDiff] = useState('');
  const [reach, setReach] = useState('');
  const [profileViews, setProfileViews] = useState('');
  const [postsCount, setPostsCount] = useState('');
  const [bestPost, setBestPost] = useState('');
  const [worstPost, setWorstPost] = useState('');
  const [tried, setTried] = useState('');
  const [copied, setCopied] = useState(false);

  const monthLabel = useMemo(() => {
    const [y, m] = month.split('-');
    return `${y}年${Number(m)}月`;
  }, [month]);

  const prompt = useMemo(
    () =>
      buildAnalysisPrompt({
        month: monthLabel,
        followers, followersDiff, reach, profileViews, postsCount,
        bestPost, worstPost, tried,
      }),
    [monthLabel, followers, followersDiff, reach, profileViews, postsCount, bestPost, worstPost, tried]
  );

  async function copy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="container">
      <span className="eyebrow">Look back, then leap.</span>
      <h1>🔍 ふりかえりプロンプトメーカー</h1>
      <p className="muted">
        Instagramのインサイト画面の数字をここに写すだけ。Claudeが分析と来月の作戦を返してくれる指示文をつくります。
        数字は<a href="/metrics">「ひろげる」</a>にも記録しておくとメディアキットに使えるよ。
      </p>

      <div className="card">
        <div className="field" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 170px' }}>
            <label>対象の月</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label>フォロワー数</label>
            <input type="text" value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="1790" />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label>前月比 <span className="hint">+30 など</span></label>
            <input type="text" value={followersDiff} onChange={(e) => setFollowersDiff(e.target.value)} placeholder="+25" />
          </div>
        </div>
        <div className="field" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label>月間リーチ</label>
            <input type="text" value={reach} onChange={(e) => setReach(e.target.value)} placeholder="18000" />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label>プロフィール閲覧</label>
            <input type="text" value={profileViews} onChange={(e) => setProfileViews(e.target.value)} placeholder="900" />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label>投稿数</label>
            <input type="text" value={postsCount} onChange={(e) => setPostsCount(e.target.value)} placeholder="8" />
          </div>
        </div>
        <div className="field">
          <label>いちばん伸びた投稿 <span className="hint">内容と数字をざっくり</span></label>
          <input type="text" value={bestPost} onChange={(e) => setBestPost(e.target.value)} placeholder="例: ガムはプラスチック製!?のコラム。リーチ5,400・保存120" />
        </div>
        <div className="field">
          <label>伸びなかった投稿</label>
          <input type="text" value={worstPost} onChange={(e) => setWorstPost(e.target.value)} placeholder="例: 活動報告。リーチ800" />
        </div>
        <div className="field">
          <label>今月あたらしく試したこと</label>
          <input type="text" value={tried} onChange={(e) => setTried(e.target.value)} placeholder="例: リールを週1で投稿してみた" />
        </div>
      </div>

      <div className="card tint-sky">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h2 style={{ margin: 0 }}>できあがったプロンプト</h2>
          <button className="btn btn-primary btn-sm" onClick={copy}>
            {copied ? 'コピーしたよ ✓' : 'コピーしてClaudeへ'}
          </button>
        </div>
        <div className="prompt-out">{prompt}</div>
      </div>
      {copied && <div className="toast">クリップボードにコピーしました 🌿</div>}
    </main>
  );
}
