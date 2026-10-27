export default function ReportCard({ title, description, onGenerate }) {
  return (
    <div className="pfl-reportcard">
      <h4>{title}</h4>
      <p>{description}</p>
      <button className="pfl-reportcard__btn" onClick={onGenerate}>
        Generate Report
      </button>
    </div>
  );
}