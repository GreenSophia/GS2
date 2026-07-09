'use client';
import { useMemo, useState } from 'react';
import { buildPastExamPrompt } from '@/lib/prompts';

export default function PastExamCard() {
  const [courseName, setCourseName] = useState('');
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => buildPastExamPrompt(courseName), [courseName]);

  async function copy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <div className="card tint-green">
        <p className="muted" style={{ margin: 0, lineHeight: 1.9 }}>
          コピーしてclaude.aiに貼り付け、<b>過去問の画像またはテキストを添付</b>してください。
          出題傾向・頻出パターン・予測範囲・学習プランをまとめて分析してくれます。
        </p>
      </div>

      <div className="card">
        <div className="field">
          <label>科目名 <span className="hint">省略可</span></label>
          <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="例: 環境倫理学" />
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>プロンプト</h2>
          <button className="btn btn-primary btn-sm" onClick={copy}>{copied ? 'コピー完了' : 'Claudeへコピー'}</button>
        </div>
        <div className="prompt-out">{prompt}</div>
      </div>
      {copied && <div className="toast">クリップボードにコピーしました</div>}
    </>
  );
}
