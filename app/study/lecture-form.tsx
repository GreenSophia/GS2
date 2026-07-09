'use client';
import { useMemo, useState } from 'react';
import { buildLecturePrompt } from '@/lib/prompts';

const LEVELS = [
  { key: 'beginner', label: '知らない前提で基礎から' },
  { key: 'review', label: '授業を聞いた前提で整理' },
  { key: 'select', label: 'レベルを自分で指定' },
] as const;

const PERSONAS = [
  { key: 'neutral', label: '中立・丁寧' },
  { key: 'strict', label: '厳しめ' },
  { key: 'friendly', label: '優しく' },
  { key: 'custom', label: 'キャラクターを指定' },
] as const;

export default function LectureForm() {
  const [courseName, setCourseName] = useState('');
  const [topicHint, setTopicHint] = useState('');
  const [level, setLevel] = useState<'beginner' | 'review' | 'select'>('review');
  const [levelDetail, setLevelDetail] = useState('');
  const [persona, setPersona] = useState<'neutral' | 'strict' | 'friendly' | 'custom'>('neutral');
  const [personaDetail, setPersonaDetail] = useState('');
  const [questions, setQuestions] = useState('');
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(
    () => buildLecturePrompt({ courseName, topicHint, level, levelDetail, persona, personaDetail, questions }),
    [courseName, topicHint, level, levelDetail, persona, personaDetail, questions]
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
          下でプロンプトを作ったら「Claudeへコピー」を押し、claude.aiを開いて<b>授業スライドの画像を添付しながら</b>プロンプトを貼り付けてください。画像はこのアプリではなく、claude.ai側で直接添付します。
        </p>
      </div>

      <div className="card">
        <div className="field">
          <label>科目名</label>
          <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="例: 環境倫理学" />
        </div>
        <div className="field">
          <label>スライドの内容のヒント <span className="hint">分かる範囲でOK。空欄でも可</span></label>
          <input type="text" value={topicHint} onChange={(e) => setTopicHint(e.target.value)} placeholder="例: 気候正義についての回" />
        </div>
        <div className="field">
          <label>説明のレベル</label>
          <div className="chips">
            {LEVELS.map((l) => (
              <button key={l.key} type="button" className={`chip ${level === l.key ? 'on' : ''}`} onClick={() => setLevel(l.key)}>{l.label}</button>
            ))}
          </div>
          {level === 'select' && (
            <input type="text" value={levelDetail} onChange={(e) => setLevelDetail(e.target.value)} placeholder="例: 高校生でも分かるレベル" style={{ marginTop: 8 }} />
          )}
        </div>
        <div className="field">
          <label>話し方・キャラクター</label>
          <div className="chips">
            {PERSONAS.map((p) => (
              <button key={p.key} type="button" className={`chip ${persona === p.key ? 'on' : ''}`} onClick={() => setPersona(p.key)}>{p.label}</button>
            ))}
          </div>
          {persona === 'custom' && (
            <input type="text" value={personaDetail} onChange={(e) => setPersonaDetail(e.target.value)} placeholder="例: 関西弁で話す陽気な先輩" style={{ marginTop: 8 }} />
          )}
        </div>
        <div className="field">
          <label>分からなかった点・質問したいこと <span className="hint">省略可</span></label>
          <textarea value={questions} onChange={(e) => setQuestions(e.target.value)} placeholder="例: グラフの縦軸の意味が分からなかった" />
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>できあがったプロンプト</h2>
          <button className="btn btn-primary btn-sm" onClick={copy}>{copied ? 'コピー完了' : 'Claudeへコピー'}</button>
        </div>
        <div className="prompt-out">{prompt}</div>
      </div>
      {copied && <div className="toast">クリップボードにコピーしました</div>}
    </>
  );
}
