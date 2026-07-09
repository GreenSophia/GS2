import ReportForm from './report-form';
import LectureForm from './lecture-form';

export default function StudyPage() {
  return (
    <main className="container">
      <section className="masthead">
        <div className="eyebrow">STUDY — 課題</div>
        <h1>大学課題</h1>
        <p className="lede">
          授業スライドの解説から、リアクションペーパー・レポートの下書きまで、Claudeに渡す指示文をここで組み立てます。
        </p>
      </section>

      <nav className="subnav" aria-label="課題内メニュー">
        <a href="#lecture" className="active">授業スライド解説</a>
        <a href="#report">レポート・リアクションペーパー</a>
      </nav>

      <div id="lecture">
        <h2 style={{ marginTop: 0 }}>授業スライド解説</h2>
        <LectureForm />
      </div>

      <div className="divider-leaf" id="report"><span>レポート・リアクションペーパー</span></div>
      <ReportForm />
    </main>
  );
}
