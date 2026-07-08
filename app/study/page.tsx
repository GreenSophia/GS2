import ReportForm from './report-form';

export default function StudyPage() {
  return (
    <main className="container">
      <section className="masthead">
        <div className="eyebrow">STUDY — 学業</div>
        <h1>大学課題</h1>
        <p className="lede">
          リアクションペーパー・レポート・小論文の下書きを、Claudeに書いてもらうための指示文を組み立てます。
          自分の実体験や立場を入れることで、AIっぽくない自分らしい文章の下書きになります。
        </p>
      </section>

      <ReportForm />
    </main>
  );
}
