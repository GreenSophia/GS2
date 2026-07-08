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
        <p className="muted" style={{ marginTop: 0 }}>
          1つのイベント情報から、メンバー向け・SNS向け・外部向けの告知文をまとめて作成します。
        </p>
        <div className="field">
          <label>だれ向け？</label>
          <div className="chips">
            {AUDIENCES.map((a) => (
              <button
                key={a.key}
                type="button"
                className={`chip ${audience === a.key ? 'on' : ''}`}
                onClick={() => setAudience(a.key)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>イベント名</label>
          <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="例: 鵠沼ビーチクリーン" />
        </div>
        <div className="field" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label>日時</label>
            <input type="text" value={datetime} onChange={(e) => setDatetime(e.target.value)} placeholder="例: 7/11(土) 16:00〜19:00" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label>場所</label>
            <input type="text" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="例: 鵠沼海岸" />
          </div>
        </div>
        <div className="field">
          <label>内容 <span className="hint">省略可</span></label>
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="例: スイカ割り、アクセサリーWSも同時開催" />
        </div>
        {(audience === 'member' || audience === 'all') && (
          <div className="field">
            <label>持ち物 <span className="hint">メンバー向けに使われます</span></label>
            <input type="text" value={bringItems} onChange={(e) => setBringItems(e.target.value)} placeholder="例: 軍手、飲み物" />
          </div>
        )}
        {(audience === 'external' || audience === 'all') && (
          <div className="field">
            <label>宛先団体名 <span className="hint">外部向けに使われます。省略可</span></label>
            <input type="text" value={externalOrg} onChange={(e) => setExternalOrg(e.target.value)} placeholder="例: 〇〇環境保護協会" />
          </div>
        )}
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
