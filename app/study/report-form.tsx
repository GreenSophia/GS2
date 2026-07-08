'use client';
import { useMemo, useState } from 'react';
import { buildReportPrompt } from '@/lib/prompts';

const TYPES = [
  { key: 'reaction', label: 'リアクションペーパー' },
  { key: 'report', label: 'レポート' },
  { key: 'essay', label: '小論文' },
] as const;

const STRENGTHS = [
  { key: 'assert', label: '断定的に主張' },
  { key: 'neutral', label: '中立的に整理' },
  { key: 'question', label: '疑問を投げかける' },
] as const;

const TONES = [
  { key: 'desumasu', label: 'ですます調' },
  { key: 'dearu', label: 'だである調' },
] as const;

export default function ReportForm() {
  const [courseName, setCourseName] = useState('');
  const [reportType, setReportType] = useState<'reaction' | 'report' | 'essay'>('reaction');
  const [keywords, setKeywords] = useState('');
  const [notes, setNotes] = useState('');
  const [hasStance, setHasStance] = useState(false);
  const [stance, setStance] = useState('');
  const [argStrength, setArgStrength] = useState<'assert' | 'neutral' | 'question'>('neutral');
  const [tone, setTone] = useState<'desumasu' | 'dearu'>('dearu');
  const [firstPerson, setFirstPerson] = useState('');
  const [citationStyle, setCitationStyle] = useState('');
  const [charCount, setCharCount] = useState('');
  const [structure, setStructure] = useState('');
  const [experience, setExperience] = useState('');
  const [avoidPhrases, setAvoidPhrases] = useState('');
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(
    () => buildReportPrompt({
      courseName, reportType, keywords, notes, hasStance, stance, argStrength,
      tone, firstPerson, citationStyle, charCount, structure, experience, avoidPhrases,
    }),
    [courseName, reportType, keywords, notes, hasStance, stance, argStrength,
     tone, firstPerson, citationStyle, charCount, structure, experience, avoidPhrases]
  );

  async function copy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <div className="card">
        <div className="field">
          <label>授業名・科目</label>
          <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="例: 環境倫理学" />
        </div>
        <div className="field">
          <label>課題の種類</label>
          <div className="chips">
            {TYPES.map((t) => (
              <button key={t.key} type="button" className={`chip ${reportType === t.key ? 'on' : ''}`} onClick={() => setReportType(t.key)}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="field">
          <label>聞き取れたキーワード・単語 <span className="hint">箇条書き・思いつくまま</span></label>
          <textarea value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="例: 気候正義、南北問題、パリ協定" />
        </div>
        <div className="field">
          <label>授業メモ・印象に残ったこと <span className="hint">雑なメモでOK</span></label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="例: 先進国と途上国の責任の違い。特に発展途上国の被害の話が印象的だった。" />
        </div>
      </div>

      <div className="card">
        <div className="field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={hasStance} onChange={(e) => setHasStance(e.target.checked)} style={{ width: 'auto' }} />
            賛否のある議題である
          </label>
        </div>
        {hasStance && (
          <>
            <div className="field">
              <label>自分の立場</label>
              <input type="text" value={stance} onChange={(e) => setStance(e.target.value)} placeholder="例: 賛成 / 反対 / 条件付き賛成" />
            </div>
            <div className="field">
              <label>論の強さ</label>
              <div className="chips">
                {STRENGTHS.map((s) => (
                  <button key={s.key} type="button" className={`chip ${argStrength === s.key ? 'on' : ''}`} onClick={() => setArgStrength(s.key)}>{s.label}</button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="field">
          <label>文体</label>
          <div className="chips">
            {TONES.map((t) => (
              <button key={t.key} type="button" className={`chip ${tone === t.key ? 'on' : ''}`} onClick={() => setTone(t.key)}>{t.label}</button>
            ))}
          </div>
        </div>
        <div className="field" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label>一人称 <span className="hint">省略可</span></label>
            <input type="text" value={firstPerson} onChange={(e) => setFirstPerson(e.target.value)} placeholder="例: 筆者 / 私 / なし" />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label>引用形式 <span className="hint">指定があれば</span></label>
            <input type="text" value={citationStyle} onChange={(e) => setCitationStyle(e.target.value)} placeholder="例: APA / 脚注" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="field" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label>文字数の目安</label>
            <input type="text" value={charCount} onChange={(e) => setCharCount(e.target.value)} placeholder="例: 800字程度" />
          </div>
          <div style={{ flex: 2, minWidth: 220 }}>
            <label>段落構成 <span className="hint">省略可</span></label>
            <input type="text" value={structure} onChange={(e) => setStructure(e.target.value)} placeholder="例: 序論・本論・結論 / 起承転結" />
          </div>
        </div>
        <div className="field">
          <label>自分の実体験・具体例 <span className="hint">独自性を出す一番のポイント</span></label>
          <textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="例: 高校時代にビーチクリーンに参加した経験があり、その時に感じたことと結びつけたい" />
        </div>
        <div className="field">
          <label>避けたい表現・言い回し <span className="hint">省略可</span></label>
          <input type="text" value={avoidPhrases} onChange={(e) => setAvoidPhrases(e.target.value)} placeholder="例: 「〜と考える」を多用したくない" />
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
