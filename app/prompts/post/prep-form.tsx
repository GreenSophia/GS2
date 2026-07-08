'use client';
import { useMemo, useState } from 'react';
import { buildPrepPlanPrompt } from '@/lib/prompts';

export default function PrepForm() {
  const [account, setAccount] = useState<'main' | 'travel'>('main');
  const [activityIdea, setActivityIdea] = useState('');
  const [date, setDate] = useState('');
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(
    () => buildPrepPlanPrompt({ account, activityIdea, date, useWebSearch }),
    [account, activityIdea, date, useWebSearch]
  );

  async function copy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <div className="card tint-green">
        <p className="muted" style={{ margin: 0, lineHeight: 1.9 }}>
          活動の<b>前</b>に使う機能です。「撮ればよかった…」を防ぐため、企画のアイデアと撮影チェックリストを先に作ります。
        </p>
      </div>

      <div className="card">
        <div className="field">
          <label>どちらのアカウント向け？</label>
          <div className="chips">
            <button type="button" className={`chip ${account === 'main' ? 'on' : ''}`} onClick={() => setAccount('main')}>Green Sophia</button>
            <button type="button" className={`chip ${account === 'travel' ? 'on' : ''}`} onClick={() => setAccount('travel')}>旅するGreen</button>
          </div>
        </div>
        <div className="field">
          <label>予定している活動 <span className="hint">まだ決まっていなければ空欄でOK</span></label>
          <input
            type="text"
            value={activityIdea}
            onChange={(e) => setActivityIdea(e.target.value)}
            placeholder="例: 8月上旬にビーチクリーンを予定している"
          />
        </div>
        <div className="field">
          <label>実施予定日 <span className="hint">分かる範囲でOK。季節感の判断に使います</span></label>
          <input type="text" value={date} onChange={(e) => setDate(e.target.value)} placeholder="例: 8月上旬 / 未定" />
        </div>
        <div className="field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={useWebSearch} onChange={(e) => setUseWebSearch(e.target.checked)} style={{ width: 'auto' }} />
            この時期の季節イベント・トレンドをClaudeにWeb検索させる
          </label>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>できあがったプロンプト</h2>
          <button className="btn btn-primary btn-sm" onClick={copy}>{copied ? 'コピー完了' : 'Claudeへコピー'}</button>
        </div>
        <div className="prompt-out">{prompt}</div>
      </div>
      {copied && <div className="toast">クリップボードにコピーしました</div>}
    </>
  );
}
