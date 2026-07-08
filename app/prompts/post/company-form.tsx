'use client';
import { useMemo, useState } from 'react';
import { buildCompanyResearchPrompt, buildCompanyPitchPrompt } from '@/lib/prompts';

export default function CompanyForm() {
  const [mode, setMode] = useState<'research' | 'pitch'>('research');
  const [copied, setCopied] = useState(false);

  const [industryHint, setIndustryHint] = useState('');
  const [budgetHint, setBudgetHint] = useState('');
  const [goal, setGoal] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [companyContext, setCompanyContext] = useState('');
  const [proposalIdea, setProposalIdea] = useState('');
  const [format, setFormat] = useState<'email' | 'onepager'>('email');

  const researchPrompt = useMemo(() => buildCompanyResearchPrompt({ industryHint, budgetHint, goal }), [industryHint, budgetHint, goal]);
  const pitchPrompt = useMemo(() => buildCompanyPitchPrompt({ companyName, companyContext, proposalIdea, format }), [companyName, companyContext, proposalIdea, format]);
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
          <button type="button" className={`chip ${mode === 'research' ? 'on' : ''}`} onClick={() => setMode('research')}>候補企業を探す</button>
          <button type="button" className={`chip ${mode === 'pitch' ? 'on' : ''}`} onClick={() => setMode('pitch')}>提案文を作る</button>
        </div>
        {mode === 'research' ? (
          <>
            <div className="field"><label>業界・分野のヒント</label><input type="text" value={industryHint} onChange={(e) => setIndustryHint(e.target.value)} /></div>
            <div className="field"><label>予算感・規模のヒント</label><input type="text" value={budgetHint} onChange={(e) => setBudgetHint(e.target.value)} /></div>
            <div className="field"><label>達成したいこと</label><input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} /></div>
          </>
        ) : (
          <>
            <div className="field"><label>相手企業</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
            <div className="field"><label>企業について分かっていること</label><textarea value={companyContext} onChange={(e) => setCompanyContext(e.target.value)} /></div>
            <div className="field"><label>提案したいコラボ内容</label><textarea value={proposalIdea} onChange={(e) => setProposalIdea(e.target.value)} /></div>
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
