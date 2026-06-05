import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, Cell,
  PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;width:100%;font-family:'Inter',sans-serif;background:#d8d2c6}


.db-shell{display:flex;height:100vh;width:100vw;overflow:hidden;background:#d8d2c6}


.db-sidebar{
  width:220px;flex-shrink:0;background:#1c2a18;
  display:flex;flex-direction:column;height:100vh;overflow:hidden;
}
.db-sidebar-top{
  padding:22px 20px 18px;
  border-bottom:1px solid rgba(255,255,255,0.07);
  display:flex;align-items:center;gap:11px;
}
.db-brand-icon{
  width:36px;height:36px;border-radius:10px;background:#2a4a24;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.db-brand-icon svg{width:19px;height:19px}
.db-brand-name{font-size:17px;font-weight:700;color:#f0ebe0;letter-spacing:-0.01em;line-height:1}
.db-brand-sub{font-size:10px;color:rgba(240,235,224,0.4);letter-spacing:0.05em;margin-top:2px}

.db-nav{flex:1;padding:14px 10px;overflow-y:auto}
.db-nav-item{
  display:flex;align-items:center;gap:10px;
  padding:11px 12px;border-radius:9px;cursor:pointer;
  font-size:13px;font-weight:500;color:rgba(240,235,224,0.5);
  margin-bottom:2px;transition:background 0.15s,color 0.15s;
}
.db-nav-item:hover{background:rgba(255,255,255,0.06);color:rgba(240,235,224,0.85)}
.db-nav-item.active{background:rgba(255,255,255,0.11);color:#f0ebe0}
.db-nav-item svg{width:17px;height:17px;opacity:0.75;flex-shrink:0}
.db-nav-item.active svg{opacity:1}

.db-sidebar-footer{
  padding:15px 18px;border-top:1px solid rgba(255,255,255,0.07);
  display:flex;align-items:center;gap:10px;
}
.db-user-avatar{
  width:34px;height:34px;border-radius:50%;background:#2a4a24;
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;color:#f0ebe0;flex-shrink:0;
}
.db-user-name{font-size:12px;font-weight:600;color:rgba(240,235,224,0.85);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
.db-user-role{font-size:10px;color:rgba(240,235,224,0.38);margin-top:1px}
.db-logout{
  background:none;border:none;cursor:pointer;
  color:rgba(240,235,224,0.3);padding:4px;transition:color 0.2s;
}
.db-logout:hover{color:#e87878}


.db-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}


.db-topbar{
  background:#243020;border-bottom:1px solid rgba(0,0,0,0.15);
  padding:0 26px;height:58px;
  display:flex;align-items:center;justify-content:space-between;flex-shrink:0;
}
.db-topbar-title{font-size:16px;font-weight:700;color:#f0ebe0}
.db-topbar-right{display:flex;align-items:center;gap:7px}
.db-period-btn{
  padding:6px 13px;border-radius:8px;border:1.5px solid rgba(240,235,224,0.15);
  font-size:12px;font-weight:600;color:rgba(240,235,224,0.5);
  background:none;cursor:pointer;transition:border-color 0.15s,color 0.15s,background 0.15s;
}
.db-period-btn.active,.db-period-btn:hover{
  border-color:#7ec896;color:#c8ddb8;background:rgba(126,200,150,0.1);
}
.db-refresh-btn{
  width:34px;height:34px;border-radius:8px;
  border:1.5px solid rgba(240,235,224,0.15);background:none;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:rgba(240,235,224,0.45);font-size:16px;
  transition:border-color 0.15s,color 0.15s;
}
.db-refresh-btn:hover{border-color:#7ec896;color:#c8ddb8}


.db-content{flex:1;overflow-y:auto;overflow-x:hidden;padding:20px 22px 48px}


.db-kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.db-kpi{
  background:#e8e2d6;border-radius:12px;
  border:1px solid rgba(0,0,0,0.08);padding:16px 18px;
  border-left:4px solid transparent;
}
.db-kpi-emoji{font-size:20px;margin-bottom:8px}
.db-kpi-label{font-size:11px;font-weight:600;color:#6b7a62;margin-bottom:4px;letter-spacing:0.02em}
.db-kpi-value{font-size:21px;font-weight:700;color:#1c2a18;letter-spacing:-0.02em;line-height:1}
.db-kpi-sub{font-size:11px;color:#8a9882;margin-top:5px}


.db-chart-row{display:grid;grid-template-columns:3fr 2fr;gap:12px;margin-bottom:12px}
.db-chart-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}


.db-card{background:#e8e2d6;border-radius:12px;border:1px solid rgba(0,0,0,0.08);overflow:hidden}
.db-card-header{
  padding:14px 18px 12px;border-bottom:1px solid rgba(0,0,0,0.07);
  display:flex;align-items:center;justify-content:space-between;
}
.db-card-title{font-size:13px;font-weight:700;color:#1c2a18;display:flex;align-items:center;gap:7px}
.db-card-title-icon{font-size:14px}
.db-card-badge{font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px}
.db-card-body{padding:14px 18px}


.db-empty{text-align:center;padding:36px 16px;color:#8a9882;font-size:13px}
.db-empty-icon{font-size:28px;margin-bottom:10px}


.db-risk-big{text-align:center;padding:10px 0 6px}
.db-risk-score{font-size:46px;font-weight:700;color:#1c2a18;letter-spacing:-0.03em;line-height:1}
.db-risk-level{
  font-size:13px;font-weight:700;padding:4px 14px;
  border-radius:20px;display:inline-block;margin-top:8px;
}
.db-risk-desc{font-size:12px;color:#6b7a62;margin-top:10px;line-height:1.6}
.db-factor-row{display:flex;align-items:center;gap:10px;margin-bottom:9px}
.db-factor-name{font-size:12px;color:#4a5c44;min-width:108px}
.db-factor-bar-bg{flex:1;height:6px;background:#ccc7ba;border-radius:3px;overflow:hidden}
.db-factor-bar-fill{height:100%;border-radius:3px;transition:width 0.8s ease}
.db-factor-val{font-size:11px;color:#8a9882;min-width:28px;text-align:right}


.db-insight{
  display:flex;gap:12px;align-items:flex-start;
  padding:11px 0;border-bottom:1px solid rgba(0,0,0,0.07);
}
.db-insight:last-child{border-bottom:none}
.db-insight-icon{font-size:17px;flex-shrink:0;margin-top:1px}
.db-insight-text{flex:1;font-size:13px;color:#2d3e28;line-height:1.65}
.db-insight-tag{
  font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;
  flex-shrink:0;margin-top:2px;text-transform:uppercase;letter-spacing:0.04em;
}


.db-exp-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid rgba(0,0,0,0.06)}
.db-exp-row:last-child{border-bottom:none}
.db-exp-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.db-exp-name{flex:1;font-size:13px;color:#2d3e28}
.db-exp-val{font-size:13px;font-weight:700;color:#1c2a18}
.db-exp-pct{font-size:11px;color:#8a9882;min-width:30px;text-align:right}


.sk{
  background:linear-gradient(90deg,#d8d2c6 25%,#ccc6ba 50%,#d8d2c6 75%);
  background-size:200% 100%;animation:shimmer 1.3s infinite;border-radius:6px;
}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}


.db-tip{
  background:#243020;border:1px solid rgba(255,255,255,0.1);
  border-radius:8px;padding:10px 14px;
  font-size:12px;color:#c8ddb8;
}
.db-tip-label{font-size:10px;font-weight:700;color:#7ec896;margin-bottom:5px;
  text-transform:uppercase;letter-spacing:0.07em}


.db-error-banner{
  background:#3d1c18;border:1px solid rgba(232,120,120,0.3);
  border-radius:10px;padding:12px 16px;
  font-size:13px;color:#e89088;margin-bottom:14px;
}


.db-bottom-nav{
  display:none;
  position:fixed;bottom:0;left:0;right:0;
  background:#1c2a18;
  border-top:1px solid rgba(255,255,255,0.08);
  padding:0 8px;padding-bottom:env(safe-area-inset-bottom,0px);
  z-index:100;height:62px;
  align-items:center;justify-content:space-around;
}
.db-bn-item{
  display:flex;flex-direction:column;align-items:center;gap:3px;
  padding:6px 12px;border-radius:8px;cursor:pointer;
  color:rgba(240,235,224,0.42);transition:color 0.15s;flex:1;
}
.db-bn-item.active{color:#c8ddb8}
.db-bn-item svg{width:21px;height:21px}
.db-bn-label{font-size:10px;font-weight:600;letter-spacing:0.02em}


@media(max-width:1100px){
  .db-kpi-row{grid-template-columns:repeat(2,1fr)}
  .db-chart-row{grid-template-columns:1fr}
}
@media(max-width:768px){
  html,body,#root{height:auto;overflow:auto}
  .db-shell{height:auto;min-height:100vh;flex-direction:column}
  .db-sidebar{display:none}
  .db-main{height:auto;overflow:visible}
  .db-topbar{
    position:sticky;top:0;z-index:50;
    padding:0 16px;height:54px;background:#1c2a18;
  }
  .db-topbar-title{font-size:15px}
  .db-content{
    flex:none;overflow:visible;
    padding:14px 14px 88px;
  }
  .db-kpi-row{grid-template-columns:1fr 1fr;gap:10px}
  .db-chart-row{grid-template-columns:1fr}
  .db-chart-row-2{grid-template-columns:1fr}
  .db-kpi-value{font-size:18px}
  .db-kpi{padding:13px 14px}
  .db-card-body{padding:12px 14px}
  .db-card-header{padding:12px 14px 10px}
  .db-bottom-nav{display:flex}
}
@media(max-width:440px){
  .db-kpi-row{grid-template-columns:1fr 1fr}
  .db-content{padding:12px 10px 88px}
}
`;


const fmt = (n) => {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n/1_000).toFixed(1)}K`;
  return Number(n).toLocaleString();
};
const fmtKES = (n) => (n == null ? "—" : `KES ${fmt(n)}`);

const RISK_COLOR = (level) => ({
  low:      { bg:"#d4f0dc", text:"#1a5c2a" },
  medium:   { bg:"#f5eac8", text:"#7a5010" },
  high:     { bg:"#f5d4d0", text:"#8b2a1e" },
  critical: { bg:"#f5c8c8", text:"#6e1a14" },
}[String(level||"").toLowerCase()] ?? { bg:"#d8d2c6", text:"#6b7a62" });

const RISK_BAR = (level) => ({
  low:"#3a8c4e", medium:"#c8900a", high:"#c83a2a", critical:"#8c1a14"
}[String(level||"").toLowerCase()] ?? "#8a9882");

const PIE_COLORS = ["#2a4a24","#3d6e38","#5a9650","#7ec896","#a8d8b0","#c8e8cc"];

const INSIGHT_ICON = (t) => ({ opportunity:"💡", warning:"⚠️", alert:"🔴", info:"ℹ️" }[t] ?? "📌");
const INSIGHT_TAG_STYLE = (s) => ({
  positive:{ background:"#c8e8d0", color:"#1a5c2a" },
  warning: { background:"#f5eac8", color:"#7a5010" },
  negative:{ background:"#f5d4d0", color:"#8b2a1e" },
  neutral: { background:"#dde8f5", color:"#1e3a6e" },
}[s] ?? { background:"#d8d2c6", color:"#6b7a62" });


function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="db-tip">
      <div className="db-tip-label">{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color, marginBottom:2 }}>
          {p.name}: {fmtKES(p.value)}
        </div>
      ))}
    </div>
  );
}

function Sk({ w="100%", h=18, mb=0 }) {
  return <div className="sk" style={{ width:w, height:h, marginBottom:mb }} />;
}

const NavSVG = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

const NAV = [
  { label:"Overview",     icon:"M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z", active:true },
  { label:"Money",        icon:"M3 3v18h18M7 16l4-4 4 4 4-8" },
  { label:"Payments",     icon:"M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2zm16 5h.01" },
  { label:"Customers",    icon:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" },
  { label:"Settings",     icon:"M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4" },
];


export default function Dashboard() {
  const nav = useNavigate();
  const [overview,  setOverview]  = useState(null);
  const [cashflow,  setCashflow]  = useState(null);
  const [risk,      setRisk]      = useState(null);
  const [insights,  setInsights]  = useState(null);
  const [expenses,  setExpenses]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [period,    setPeriod]    = useState("7M");

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [o,c,r,i] = await Promise.all([
        api.get("/dashboard/overview"),
        api.get("/dashboard/cashflow"),
        api.get("/dashboard/risk"),
        api.get("/dashboard/insights"),
      ]);
      setOverview(o.data || null);
      setCashflow(c.data || null);
      setRisk(r.data || null);
      setInsights(i.data || null);
      setExpenses(c.data?.expenses_breakdown || null);
    } catch {
      setError("Could not load your data. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const riskColors = RISK_COLOR(risk?.level);
  const riskBarCol = RISK_BAR(risk?.level);
  const healthColor = overview?.health_score >= 70 ? "#2a6e3e"
    : overview?.health_score >= 40 ? "#a16207" : "#b91c1c";
  const totalExp = (expenses||[]).reduce((s,e) => s+(e.value||0), 0);
  const cfSeries = cashflow?.series || [];
  const insightList = Array.isArray(insights) ? insights : [];

  return (
    <>
      <style>{CSS}</style>
      <div className="db-shell">

        {/* SIDEBAR — desktop only */}
        <aside className="db-sidebar">
          <div className="db-sidebar-top">
            <div className="db-brand-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" stroke="#c8ddb8" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M10 2V18M2 7L18 13M18 7L2 13" stroke="#c8ddb8" strokeWidth="1" opacity="0.5"/>
              </svg>
            </div>
            <div>
              <div className="db-brand-name">HustleIQ</div>
              <div className="db-brand-sub">Business Platform</div>
            </div>
          </div>

          <nav className="db-nav">
            {NAV.map(({ label, icon, active }) => (
              <div key={label} className={`db-nav-item${active ? " active" : ""}`}>
                <NavSVG d={icon}/>{label}
              </div>
            ))}
          </nav>

          <div className="db-sidebar-footer">
            <div className="db-user-avatar">BN</div>
            <div style={{ flex:1, overflow:"hidden" }}>
              <div className="db-user-name">Business Name</div>
              <div className="db-user-role">Owner</div>
            </div>
            <button className="db-logout" title="Sign out"
              onClick={() => { localStorage.removeItem("token"); nav("/"); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="db-main">
          <div className="db-topbar">
            <span className="db-topbar-title">My Business</span>
            <div className="db-topbar-right">
              {["3M","7M","1Y"].map((p) => (
                <button key={p}
                  className={`db-period-btn${period===p ? " active" : ""}`}
                  onClick={() => { setPeriod(p); loadData(); }}>
                  {p}
                </button>
              ))}
              <button className="db-refresh-btn" onClick={loadData} title="Refresh">↻</button>
            </div>
          </div>

          <div className="db-content">

            {error && !loading && (
              <div className="db-error-banner">{error}</div>
            )}

            {/* KPI CARDS */}
            <div className="db-kpi-row">
              <div className="db-kpi" style={{ borderLeftColor:"#2a6e3e" }}>
                {loading ? (<><Sk w="40%" h={10} mb={10}/><Sk w="65%" h={24} mb={8}/><Sk w="50%" h={10}/></>) : (<>
                  <div className="db-kpi-emoji">P</div>
                  <div className="db-kpi-label">Profit</div>
                  <div className="db-kpi-value" style={{ color:"#2a6e3e" }}>{fmtKES(overview?.summary?.profit)}</div>
                  <div className="db-kpi-sub">Money made</div>
                </>)}
              </div>
              <div className="db-kpi" style={{ borderLeftColor:"#2a5080" }}>
                {loading ? (<><Sk w="40%" h={10} mb={10}/><Sk w="65%" h={24} mb={8}/><Sk w="50%" h={10}/></>) : (<>
                  <div className="db-kpi-emoji">I</div>
                  <div className="db-kpi-label">Money In</div>
                  <div className="db-kpi-value">{fmtKES(overview?.summary?.revenue)}</div>
                  <div className="db-kpi-sub">Total sales</div>
                </>)}
              </div>
              <div className="db-kpi" style={{ borderLeftColor:"#8b2a1e" }}>
                {loading ? (<><Sk w="40%" h={10} mb={10}/><Sk w="65%" h={24} mb={8}/><Sk w="50%" h={10}/></>) : (<>
                  <div className="db-kpi-emoji">O</div>
                  <div className="db-kpi-label">Money Out</div>
                  <div className="db-kpi-value">{fmtKES(overview?.summary?.expenses)}</div>
                  <div className="db-kpi-sub">Total costs</div>
                </>)}
              </div>
              <div className="db-kpi" style={{ borderLeftColor:healthColor }}>
                {loading ? (<><Sk w="40%" h={10} mb={10}/><Sk w="65%" h={24} mb={8}/><Sk w="50%" h={10}/></>) : (<>
                  <div className="db-kpi-emoji">H</div>
                  <div className="db-kpi-label">Health Score</div>
                  <div className="db-kpi-value" style={{ color:healthColor }}>
                    {overview?.health_score != null ? `${overview.health_score}%` : "—"}
                  </div>
                  <div className="db-kpi-sub">
                    {overview?.summary?.transactions != null
                      ? `${overview.summary.transactions} transactions`
                      : "No data yet"}
                  </div>
                </>)}
              </div>
            </div>

            {/* CASHFLOW + RISK */}
            <div className="db-chart-row">
              <div className="db-card">
                <div className="db-card-header">
                  <div className="db-card-title">
                    <span className="db-card-title-icon">I/O</span>
                    Money In vs Money Out
                  </div>
                </div>
                <div className="db-card-body">
                  {loading ? <Sk w="100%" h={200}/> : cfSeries.length === 0 ? (
                    <div className="db-empty">
                      <div className="db-empty-icon">Chat</div>
                      No data yet. Add transactions to see your chart.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={210}>
                      <AreaChart data={cfSeries} margin={{ top:4, right:4, left:-14, bottom:0 }}>
                        <defs>
                          <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3a8c4e" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3a8c4e" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#c83a2a" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#c83a2a" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#ccc7ba" strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="month"
                          tick={{ fill:"#8a9882", fontSize:11, fontFamily:"Inter" }}
                          axisLine={false} tickLine={false} dy={6}/>
                        <YAxis
                          tick={{ fill:"#8a9882", fontSize:11, fontFamily:"Inter" }}
                          axisLine={false} tickLine={false}
                          tickFormatter={(v) => `${(v/1000).toFixed(0)}K`}/>
                        <Tooltip content={<ChartTip/>}/>
                        <Area type="monotone" dataKey="income" name="Money In"
                          stroke="#3a8c4e" strokeWidth={2}
                          fill="url(#incG)" dot={false} activeDot={{ r:5, fill:"#3a8c4e" }}/>
                        <Area type="monotone" dataKey="expenses" name="Money Out"
                          stroke="#c83a2a" strokeWidth={2}
                          fill="url(#expG)" dot={false} activeDot={{ r:5, fill:"#c83a2a" }}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="db-card">
                <div className="db-card-header">
                  <div className="db-card-title">
                    <span className="db-card-title-icon">RL</span>
                    Risk Level
                  </div>
                  {risk?.level && (
                    <span className="db-card-badge" style={{ background:riskColors.bg, color:riskColors.text }}>
                      {risk.level.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="db-card-body">
                  {loading ? (<><Sk w="100%" h={120} mb={14}/><Sk w="100%" h={70}/></>) :
                  !risk ? (
                    <div className="db-empty"><div className="db-empty-icon">Risk</div>No risk data yet.</div>
                  ) : (
                    <>
                      <div className="db-risk-big">
                        <div className="db-risk-score">{risk.score ?? "—"}</div>
                        <div className="db-risk-level" style={{ background:riskColors.bg, color:riskColors.text }}>
                          {risk.level ? `${risk.level} risk` : "Unknown"}
                        </div>
                        {risk.description && <p className="db-risk-desc">{risk.description}</p>}
                      </div>
                      {(risk.factors||[]).length > 0 && (
                        <div style={{ marginTop:14 }}>
                          {risk.factors.map((f) => (
                            <div key={f.name} className="db-factor-row">
                              <span className="db-factor-name">{f.name}</span>
                              <div className="db-factor-bar-bg">
                                <div className="db-factor-bar-fill"
                                  style={{ width:`${f.value}%`, background:riskBarCol }}/>
                              </div>
                              <span className="db-factor-val">{f.value}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* EXPENSES + MONTHLY PROFIT */}
            <div className="db-chart-row-2">
              <div className="db-card">
                <div className="db-card-header">
                  <div className="db-card-title">
                    <span className="db-card-title-icon">M</span>
                    Where Money Goes
                  </div>
                </div>
                <div className="db-card-body">
                  {loading ? <Sk w="100%" h={190}/> : (!expenses||expenses.length===0) ? (
                    <div className="db-empty"><div className="db-empty-icon">Expense</div>No expense data yet.</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={130}>
                        <PieChart>
                          <Pie data={expenses} dataKey="value" nameKey="name"
                            cx="50%" cy="50%"
                            innerRadius={36} outerRadius={58}
                            paddingAngle={3} stroke="none">
                            {expenses.map((_,i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v) => fmtKES(v)}
                            contentStyle={{
                              background:"#243020", border:"1px solid rgba(255,255,255,0.1)",
                              borderRadius:8, fontSize:12, color:"#c8ddb8",
                            }}/>
                        </PieChart>
                      </ResponsiveContainer>
                      <div>
                        {expenses.map((e,i) => (
                          <div key={e.name} className="db-exp-row">
                            <div className="db-exp-dot" style={{ background:PIE_COLORS[i%PIE_COLORS.length] }}/>
                            <span className="db-exp-name">{e.name}</span>
                            <span className="db-exp-val">{fmtKES(e.value)}</span>
                            <span className="db-exp-pct">
                              {totalExp ? Math.round((e.value/totalExp)*100) : 0}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="db-card">
                <div className="db-card-header">
                  <div className="db-card-title">
                    <span className="db-card-title-icon">Profit</span>
                    Monthly Profit
                  </div>
                </div>
                <div className="db-card-body">
                  {loading ? <Sk w="100%" h={250}/> : cfSeries.length===0 ? (
                    <div className="db-empty"><div className="db-empty-icon">Data</div>No data yet.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={cfSeries.map((s) => ({
                          month:s.month,
                          profit:(s.income??0)-(s.expenses??0),
                        }))}
                        margin={{ top:4, right:4, left:-14, bottom:0 }}
                        barCategoryGap="35%">
                        <CartesianGrid stroke="#ccc7ba" strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="month"
                          tick={{ fill:"#8a9882", fontSize:11, fontFamily:"Inter" }}
                          axisLine={false} tickLine={false} dy={6}/>
                        <YAxis
                          tick={{ fill:"#8a9882", fontSize:11, fontFamily:"Inter" }}
                          axisLine={false} tickLine={false}
                          tickFormatter={(v) => `${(v/1000).toFixed(0)}K`}/>
                        <Tooltip content={<ChartTip/>}/>
                        <Bar dataKey="profit" name="Profit" radius={[4,4,0,0]}>
                          {cfSeries.map((s,i) => {
                            const p = (s.income??0)-(s.expenses??0);
                            return <Cell key={i} fill={p>=0 ? "#3a8c4e" : "#c83a2a"}/>;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* AI INSIGHTS */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">
                  <span className="db-card-title-icon">SM</span>
                  Smart Tips for Your Business
                </div>
              </div>
              <div className="db-card-body">
                {loading ? [1,2,3].map((k) => <Sk key={k} w="100%" h={42} mb={10}/>) :
                insightList.length===0 ? (
                  <div className="db-empty">
                    <div className="db-empty-icon">Tips</div>
                    No tips yet. Add more data to get personalised advice.
                  </div>
                ) : insightList.map((item,i) => {
                  const text     = typeof item==="string" ? item : item.text;
                  const severity = item.severity ?? "neutral";
                  const tag      = item.type ?? "info";
                  return (
                    <div key={i} className="db-insight">
                      <div className="db-insight-icon">{INSIGHT_ICON(tag)}</div>
                      <span className="db-insight-text">{text}</span>
                      <div className="db-insight-tag" style={INSIGHT_TAG_STYLE(severity)}>{tag}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </main>

        {/* BOTTOM NAV — mobile only */}
        <nav className="db-bottom-nav">
          {NAV.map(({ label, icon, active }) => (
            <div key={label} className={`db-bn-item${active ? " active" : ""}`}>
              <NavSVG d={icon}/>
              <span className="db-bn-label">{label}</span>
            </div>
          ))}
        </nav>

      </div>
    </>
  );
}