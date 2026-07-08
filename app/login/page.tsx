'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!passcode) return;
    setBusy(true);
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    if (res.ok) {
      window.location.href = '/';
    } else {
      setError('パスワードが違います');
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: '12vh' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <span className="eyebrow">Welcome back!</span>
        <h1>Green Sophia<br />SNS Copilot</h1>
        <p className="muted">パスワード入力</p>
        <div className="field" style={{ textAlign: 'left' }}>
          <input
            type="password"
            placeholder="パスワード"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            autoFocus
          />
        </div>
        {error && <p style={{ color: '#c0563a', fontSize: '.86rem' }}>{error}</p>}
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={submit} disabled={busy}>
          {busy ? 'Loading…' : 'Enter'}
        </button>
        <p className="muted" style={{ marginTop: 14, fontSize: '.78rem' }}>
          パスワードは情報班へ
        </p>
      </div>
    </div>
  );
}
