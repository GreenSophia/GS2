import ReportForm from './report-form';
import LectureForm from './lecture-form';
import PastExamCard from './past-exam-card';

export default function StudyPage() {
  return (
    <main className="container">
      <section className="masthead">
        <div className="eyebrow">STUDY — 学業</div>
        <h1>大学課題</h1>
        <p className="lede">
          授業スライドの解説、過去問分析から、レポート・リアクションペーパーの下書きまで、Claudeに渡す指示文をここで組み立てます。
        </p>
      </section>

      <nav className="subnav" aria-label="学業内メニュー">
        <a href="#lecture" className="active">授業スライド解説</a>
        <a href="#exam">過去問分析</a>
        <a href="#report">レポート・リアクションペーパー</a>
      </nav>

      <div id="lecture">
        <h2 style={{ marginTop: 0 }}>授業スライド解説</h2>
        <LectureForm />
      </div>

      <div className="divider-leaf" id="exam"><span>過去問分析</span></div>
      <PastExamCard />

      <div className="divider-leaf" id="report"><span>レポート・リアクションペーパー</span></div>
      <ReportForm />
    </main>
  );
}
