'use client';
import { useMemo, useState } from 'react';
import { buildCompanyResearchPrompt, buildCompanyPitchPrompt } from '@/lib/prompts';

export default function CompanyForm() {
  const [mode, setMode] = useState<'research' | 'pitch'>('research');
  const [copied, setCopied] = useState(false);

  // リサーチ用
  const [industryHint, setIndustryHint] = useState('');
  const [budgetHint, setBudgetHint] = useState('');
  const [goal, setGoal] = useState('');

  // 提案文用
  const [companyName, setCompanyName] = useState('');
  const [companyContext, setCompanyContext] = useState('');
  const [proposalIdea, setProposalIdea] = useState('');
  const [format, setFormat] = useState<'email' | 'onepager'>('email');

  const researchPrompt = useMemo(
    () => buildCompanyResearchPrompt({ industryHint, budgetHint, goal }),
    [industryHint, budgetHint, goal]
  );
  const pitchPrompt = useMemo(
    () => buildCompanyPitchPrompt({ companyName, companyContext, proposalIdea, format }),
    [companyName, companyContext, proposalIdea, format]
  );

  const prompt = mode === 'research' ? researchPrompt : pitchPrompt;

  async function copy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <div className="card">
        <div className="chips" style={{ marginBottom: 16 }}>
          <button type="button" className={`chip ${mode === 'research' ? 'on' : ''}`} onClick={() => setMode('research')}>
            候補企業を探す
          </button>
          <button type="button" className={`chip ${mode === 'pitch' ? 'on' : ''}`} onClick={() => setMode('pitch')}>
            提案文を作る
          </button>
        </div>

        {mode === 'research' ? (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              Claude（Web検索つき）に、交渉に行けそうな企業をリサーチさせるためのプロンプトです。
              <a href="/stocks">記録</a>のスポンサー候補も参考にどうぞ。
            </p>
            <div className="field">
              <label>業界・分野のヒント <span className="hint">省略可</span></label>
              <input type="text" value={industryHint} onChange={(e) => setIndustryHint(e.target.value)} placeholder="例: 食品・飲料メーカー、アウトドア用品ブランド" />
            </div>
            <div className="field">
              <label>予算感・規模のヒント <span className="hint">省略可</span></label>
              <input type="text" value={budgetHint} onChange={(e) => setBudgetHint(e.target.value)} placeholder="例: 学生団体との協業実績がある企業" />
            </div>
            <div className="field">
              <label>このコラボで達成したいこと <span className="hint">省略可</span></label>
              <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="例: 物品協賛と、イベント共催の両方" />
            </div>
          </>
        ) : (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              相手企業が決まっている場合、提案メール・資料の下書きを作るプロンプトです。
            </p>
            <div className="field">
              <label>相手企業</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="例: 株式会社〇〇" />
            </div>
            <div className="field">
              <label>その企業について分かっていること <span className="hint">省略可</span></label>
              <textarea value={companyContext} onChange={(e) => setCompanyContext(e.target.value)} placeholder="例: サステナビリティ推進室があり、過去に他大学と連携実績あり" />
            </div>
            <div className="field">
              <label>提案したいコラボ内容</label>
              <textarea value={proposalIdea} onChange={(e) => setProposalIdea(e.target.value)} placeholder="例: ビーチクリーンイベントへの物品協賛と、ブース出展のお願い" />
            </div>
            <div className="field">
              <label>形式</label>
              <div className="chips">
                <button type="button" className={`chip ${format === 'email' ? 'on' : ''}`} onClick={() => setFormat('email')}>メール文</button>
                <button type="button" className={`chip ${format === 'onepager' ? 'on' : ''}`} onClick={() => setFormat('onepager')}>提案資料の構成</button>
              </div>
            </div>
          </>
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
