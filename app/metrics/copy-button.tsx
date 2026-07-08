'use client';
import { useState } from 'react';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <button
        className="btn btn-primary btn-sm"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
      >
        {copied ? 'コピーしたよ ✓' : 'コピーする'}
      </button>
      {copied && <div className="toast">クリップボードにコピー完了</div>}
    </>
  );
}
