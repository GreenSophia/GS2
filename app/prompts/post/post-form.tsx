'use client';
import { useMemo, useState } from 'react';
import { buildPostPrompt, buildImagePrompt } from '@/lib/prompts';

const TARGETS = ['環境に興味がある大学生', '新入生（入会検討中）', 'サークルをよく知らない一般学生', 'コラボ先の企業・団体', 'すでにフォローしてくれている人'];
const TARGETS_TRAVEL = ['旅好き・地域に興味がある人', 'その土地に縁がある人', 'コラボ先の企業・団体', 'すでにフォローしてくれている人'];
const GOALS = ['イベント参加を増やす', '入会DMにつなげる', '保存されるお役立ち投稿にする', 'フォロワーを増やす', '活動をきちんと報告する'];
const GOALS_TRAVEL = ['その町に行ってみたいと思わせる', 'パートナー募集につなげる', '活動をきちんと報告する', 'フォロワーを増やす'];
const MOODS = ['水彩・パステル', '手描きイラスト風', '写真そのまま・自然な雰囲気', '図解・インフォグラフィック風', 'ポップでカラフル'];
const SLIDE_ROLES = ['表紙（1枚目）', '説明・中面', 'まとめ・締め'];

function Chips({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="chips" role="radiogroup">
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={value === o} className={`chip ${value === o ? 'on' : ''}`} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

function MultiChips({ options, values, onChange }: { options: string[]; values: string[]; onChange: (v: string[]) => void }) {
  function toggle(o: string) {
    onChange(values.includes(o) ? values.filter((v) => v !== o) : [...values, o]);
  }
  return (
    <div className="chips" role="group">
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={values.includes(o)} className={`chip ${values.includes(o) ? 'on' : ''}`} onClick={() => toggle(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

export default function PostForm({ recentRefs = [] }: { recentRefs?: string[] }) {
  const [account, setAccount] = useState<'main' | 'travel'>('main');
  const isTravel = account === 'travel';

  const [theme, setTheme] = useState('');
  const [detail, setDetail] = useState('');
  const [targets, setTargets] = useState<string[]>([TARGETS[0]]);
  const [goals, setGoals] = useState<string[]>([GOALS[0]]);
  const [slides, setSlides] = useState(6);
  const [cta, setCta] = useState('');
  const [copied, setCopied] = useState('');
  const [mood, setMood] = useState(MOODS[0]);
  const [slideRole, setSlideRole] = useState(SLIDE_ROLES[0]);
  const [useRefs, setUseRefs] = useState(true);
  const [useWebSearch, setUseWebSearch] = useState(true);

  const [area, setArea] = useState('');
  const [charm, setCharm] = useState('');
  const [peopleMet, setPeopleMet] = useState('');

  function switchAccount(next: 'main' | 'travel') {
    setAccount(next);
    setTargets([next === 'travel' ? TARGETS_TRAVEL[0] : TARGETS[0]]);
    setGoals([next === 'travel' ? GOALS_TRAVEL[0] : GOALS[0]]);
  }

  const prompt = useMemo(
    () => buildPostPrompt({
      account, theme, detail,
      target: targets.join('、') || '未選択',
      slides,
      goal: goals.join('、') || '未選択',
      cta, area, charm, peopleMet,
      recentRefs: useRefs ? recentRefs : undefined,
      useWebSearch,
    }),
    [account, theme, detail, targets, slides, goals, cta, area, charm, peopleMet, useRefs, recentRefs, useWebSearch]
  );

  const imagePrompt = useMemo(
    () => buildImagePrompt({ theme, detail, mood, slideRole }),
    [theme, detail, mood, slideRole]
  );

  async function copy(text: string, which: string) {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(''), 1800);
  }

  return (
    <>
      <div className="card">
        <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, marginBottom: 8 }}>どちらのアカウントの投稿？</label>
        <div className="chips">
          <button type="button" className={`chip ${!isTravel ? 'on' : ''}`} onClick={() => switchAccount('main')}>Green Sophia</button>
          <button type="button" className={`chip ${isTravel ? 'on' : ''}`} onClick={() => switchAccount('travel')}>旅するGreen</button>
        </div>
      </div>

      <div className="card">
        <div className="field">
          <label>1. なにについての投稿？</label>
          <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="例: 鵠沼海岸でのビーチクリーン" />
        </div>
        <div className="field">
          <label>2. くわしい内容</label>
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="例: 7/11(土) 16-19時 鵠沼海岸でビーチクリーン。" />
        </div>
        {isTravel && (
          <>
            <div className="field"><label>3. 訪問地</label><input type="text" value={area} onChange={(e) => setArea(e.target.value)} /></div>
            <div className="field"><label>4. 体験した魅力</label><input type="text" value={charm} onChange={(e) => setCharm(e.target.value)} /></div>
            <div className="field"><label>5. 出会った人・団体</label><input type="text" value={peopleMet} onChange={(e) => setPeopleMet(e.target.value)} /></div>
          </>
        )}
        <div className="field"><label>だれに届けたい？（複数選択可）</label><MultiChips options={isTravel ? TARGETS_TRAVEL : TARGETS} values={targets} onChange={setTargets} /></div>
        <div className="field"><label>ゴールは？（複数選択可）</label><MultiChips options={isTravel ? GOALS_TRAVEL : GOALS} values={goals} onChange={setGoals} /></div>
        <div className="field" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 150px' }}><label>画像枚数</label><input type="number" min={1} max={10} value={slides} onChange={(e) => setSlides(Number(e.target.value))} /></div>
          <div style={{ flex: 1, minWidth: 220 }}><label>読者にしてほしい行動</label><input type="text" value={cta} onChange={(e) => setCta(e.target.value)} /></div>
        </div>
        <div className="field" style={{ borderTop: '1px solid var(--rule)', paddingTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={useWebSearch} onChange={(e) => setUseWebSearch(e.target.checked)} style={{ width: 'auto' }} />
            Claudeに最近の話題をWeb検索させる
          </label>
          {recentRefs.length > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <input type="checkbox" checked={useRefs} onChange={(e) => setUseRefs(e.target.checked)} style={{ width: 'auto' }} />
              記録の参考ストック（{recentRefs.length}件）を使う
            </label>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>文章用プロンプト</h2>
          <button className="btn btn-primary btn-sm" onClick={() => copy(prompt, 'text')}>{copied === 'text' ? 'コピー完了' : 'Claudeへコピー'}</button>
        </div>
        <div className="prompt-out">{prompt}</div>
      </div>

      <div className="card">
        <h2>画像生成プロンプト</h2>
        <div className="field"><label>雰囲気</label><Chips options={MOODS} value={mood} onChange={setMood} /></div>
        <div className="field"><label>どのスライド用？</label><Chips options={SLIDE_ROLES} value={slideRole} onChange={setSlideRole} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>画像生成プロンプト</h3>
          <button className="btn btn-primary btn-sm" onClick={() => copy(imagePrompt, 'image')}>{copied === 'image' ? 'コピー完了' : 'コピー'}</button>
        </div>
        <div className="prompt-out">{imagePrompt}</div>
      </div>

      {copied && <div className="toast">クリップボードにコピーしました</div>}
    </>
  );
}
