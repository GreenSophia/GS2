import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Green Sophia SNS Copilot',
  description: 'Learn with us, act with Green Sophia, inspire others.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <a href="/" className="brand">
            <span className="logo-script">Green Sophia</span>
            <span style={{ fontSize: '.82rem' }}>SNS Copilot</span>
          </a>
          <nav className="nav" aria-label="メイン">
            {/* 理念そのままの3ブロック: Learn=ためる / Act=つくる / Inspire=ひろげる */}
            <a href="/stocks">🌱 ためる</a>
            <a href="/prompts/post">✍️ つくる</a>
            <a href="/prompts/analysis">🔍 ふりかえる</a>
            <a href="/portal">🎨 Canva棚</a>
            <a href="/metrics">📈 ひろげる</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
