'use client';
import { useMemo, useState } from 'react';
import { buildAnnouncementPrompt } from '@/lib/prompts';

const AUDIENCES = [
  { key: 'all', label: '3つまとめて' },
  { key: 'member', label: 'メンバー向け' },
  { key: 'sns', label: 'SNS向け' },
  { key: 'external', label: '外部向け' },
] as const;

export default function AnnouncementForm() {
  const [audience, setAudience] = useState<'member' | 'sns' | 'external' | 'all'>('all');
  const [eventName, setEventName] = useState('');
  const [datetime, setDatetime] = useState('');
  const [place, setPlace] = useState('');
  const [detail, setDetail] = useState('');
  const [bringItems, setBringItems] = useState('');
  const [externalOrg, setExternalOrg] = useState('');
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(
    () => buildAnnouncementPrompt({ eventName, datetime, place, detail, bringItems, audience, externalOrg }),
    [eventName, datetime, place, detail, bringItems, audience, externalOrg]
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
          <label>だれ向け？</label>
          <div className="chips">
            {AUDIENCES.map((a) => (
              <button key={a.key} type="button" className={`chip ${audience === a.key ? 'on' : ''}`} onClick={() => setAudience(a.key)}>{a.label}</button>
            ))}
          </div>
        </div>
        <div className="field"><label>イベント名</label><input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} /></div>
        <div className="field" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}><label>日時</label><input type="text" value={datetime} onChange={(e) => setDatetime(e.target.value)} /></div>
          <div style={{ flex: 1, minWidth: 200 }}><label>場所</label><input type="text" value={place} onChange={(e) => setPlace(e.target.value)} /></div>
        </div>
        <div className="field"><label>内容</label><textarea value={detail} onChange={(e) => setDetail(e.target.value)} /></div>
        {(audience === 'member' || audience === 'all') && (
          <div className="field"><label>持ち物</label><input type="text" value={bringItems} onChange={(e) => setBringItems(e.target.value)} /></div>
        )}
        {(audience === 'external' || audience === 'all') && (
          <div className="field"><label>宛先団体名</label><input type="text" value={externalOrg} onChange={(e) => setExternalOrg(e.target.value)} /></div>
        )}
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
