'use client';
import { useMemo, useState } from 'react';
import { buildMeetingPrompt, type AgendaItem } from '@/lib/prompts';

function emptyItem(): AgendaItem {
  return { topic: '', rawNotes: '', decision: '', owner: '', deadline: '' };
}

export default function MeetingForm() {
  const [meetingName, setMeetingName] = useState('');
  const [date, setDate] = useState('');
  const [attendees, setAttendees] = useState('');
  const [absentees, setAbsentees] = useState('');
  const [items, setItems] = useState<AgendaItem[]>([emptyItem()]);
  const [copied, setCopied] = useState(false);

  function updateItem(idx: number, patch: Partial<AgendaItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }
  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const prompt = useMemo(
    () => buildMeetingPrompt({ meetingName, date, attendees, absentees, items }),
    [meetingName, date, attendees, absentees, items]
  );

  async function copy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <div className="card tint-green">
        <h3 style={{ marginBottom: 10 }}>会議を円滑に進めるコツ</h3>
        <p className="muted" style={{ margin: 0, lineHeight: 1.9 }}>
          議題ごとに話し終えたら、次に進む前に「これは決定か、持ち越しか」「誰が・いつまでにやるか」を口に出して確認してください。
          その場でこのフォームに書き込みながら進めると、会議が終わった時点でメモがそのまま議事録の下書きになります。
        </p>
      </div>

      <div className="card">
        <div className="field">
          <label>会議名 <span className="hint">自由記述（例: 幹部会、旅するGreen定例MTG）</span></label>
          <input type="text" value={meetingName} onChange={(e) => setMeetingName(e.target.value)} placeholder="例: 7月度 幹部会" />
        </div>
        <div className="field" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label>日時</label>
            <input type="text" value={date} onChange={(e) => setDate(e.target.value)} placeholder="例: 7/10(木) 19:00〜" />
          </div>
        </div>
        <div className="field" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label>出席者</label>
            <input type="text" value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="例: 山田、佐藤、鈴木" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label>欠席者 <span className="hint">省略可</span></label>
            <input type="text" value={absentees} onChange={(e) => setAbsentees(e.target.value)} />
          </div>
        </div>
      </div>

      {items.map((item, idx) => (
        <div className="card" key={idx}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>議題 {idx + 1}</h3>
            {items.length > 1 && (
              <button className="btn btn-ghost btn-sm" onClick={() => removeItem(idx)}>この議題を削除</button>
            )}
          </div>
          <div className="field">
            <label>議題 <span className="hint">自由に入力</span></label>
            <input
              type="text"
              value={item.topic}
              onChange={(e) => updateItem(idx, { topic: e.target.value })}
              placeholder="例: 夏の合宿の日程について"
            />
          </div>
          <div className="field">
            <label>話した内容 <span className="hint">ざっくりメモでOK</span></label>
            <textarea
              value={item.rawNotes}
              onChange={(e) => updateItem(idx, { rawNotes: e.target.value })}
              placeholder="箇条書きでも文章でも、話しながらそのまま書いてください"
            />
          </div>
          <div className="field" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 200 }}>
              <label>決定事項 <span className="hint">決まらなければ「保留」でOK</span></label>
              <input type="text" value={item.decision} onChange={(e) => updateItem(idx, { decision: e.target.value })} placeholder="例: 8月上旬に開催、会場は候補A" />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label>担当者</label>
              <input type="text" value={item.owner} onChange={(e) => updateItem(idx, { owner: e.target.value })} placeholder="例: 山田" />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label>期限</label>
              <input type="text" value={item.deadline} onChange={(e) => updateItem(idx, { deadline: e.target.value })} placeholder="例: 7/20まで" />
            </div>
          </div>
        </div>
      ))}

      <button className="btn btn-ghost" onClick={addItem} style={{ marginBottom: 24 }}>
        ＋ 議題を追加する
      </button>

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
