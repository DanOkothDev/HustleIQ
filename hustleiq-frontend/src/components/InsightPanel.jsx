export default function InsightPanel({ insights }) {

  if (!insights) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Insights</h3>

      {insights.insights?.map((i, idx) => (
        <p key={idx}>{i}</p>
      ))}

      <h4>Alerts</h4>
      {insights.alerts?.map((a, idx) => (
        <p key={idx}>{a}</p>
      ))}

      <h4>Positives</h4>
      {insights.positives?.map((p, idx) => (
        <p key={idx}>{p}</p>
      ))}
    </div>
  );
}