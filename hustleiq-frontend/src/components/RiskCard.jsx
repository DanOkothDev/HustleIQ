export default function RiskCard({ risk }) {

  if (!risk) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Risk Score: {risk.risk_score}</h3>
      <h4>Level: {risk.risk_level}</h4>

      <ul>
        {risk.signals?.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}