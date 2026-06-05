import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const bgPhoto = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;width:100%;font-family:'Inter',sans-serif}

.lg-root{display:flex;min-height:100vh;width:100%;background:#1c2a18}

.lg-photo{
  width:42%;flex-shrink:0;position:sticky;top:0;height:100vh;overflow:hidden;
}
.lg-photo img{width:100%;height:100%;object-fit:cover;filter:brightness(0.45) saturate(0.4)}
.lg-photo-overlay{
  position:absolute;inset:0;
  background:linear-gradient(160deg,rgba(18,34,14,0.55) 0%,rgba(34,60,22,0.6) 100%);
}
.lg-photo-copy{position:absolute;bottom:52px;left:44px;right:32px}
.lg-tagline{font-size:34px;font-weight:700;color:#f0ebe0;line-height:1.2;margin-bottom:14px}
.lg-sub{font-size:14px;color:rgba(240,235,224,0.65);line-height:1.65}
.lg-stats{
  display:flex;gap:28px;margin-top:28px;padding-top:22px;
  border-top:1px solid rgba(255,255,255,0.15);
}
.lg-stat-n{font-size:22px;font-weight:700;color:#f0ebe0;line-height:1}
.lg-stat-l{font-size:11px;color:rgba(240,235,224,0.5);margin-top:4px;text-transform:uppercase;letter-spacing:0.07em}

.lg-panel{
  flex:1;display:flex;align-items:center;justify-content:center;
  background:#eee9df;padding:40px 48px;overflow-y:auto;
}
.lg-inner{width:100%;max-width:400px}

.lg-brand{display:flex;align-items:center;gap:11px;margin-bottom:44px}
.lg-brand-icon{
  width:40px;height:40px;border-radius:11px;background:#2a4a24;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.lg-brand-icon svg{width:22px;height:22px}
.lg-brand-name{font-size:20px;font-weight:700;color:#1c2a18;letter-spacing:-0.01em;line-height:1}
.lg-brand-sub{font-size:11px;color:#7a8c72;letter-spacing:0.05em;margin-top:2px}

.lg-heading{margin-bottom:30px}
.lg-heading h2{font-size:26px;font-weight:700;color:#1c2a18;letter-spacing:-0.02em;line-height:1.1}
.lg-heading p{font-size:14px;color:#7a8c72;margin-top:6px}

.lg-field{margin-bottom:14px}
.lg-label{display:block;font-size:12px;font-weight:600;color:#3d5238;margin-bottom:6px;letter-spacing:0.03em}
.lg-input{
  width:100%;padding:13px 15px;
  border:1.5px solid #ccc7ba;border-radius:10px;
  font-size:15px;font-family:'Inter',sans-serif;
  color:#1c2a18;background:#f5f1e9;
  outline:none;transition:border-color 0.2s,box-shadow 0.2s;
}
.lg-input:focus{border-color:#2a4a24;box-shadow:0 0 0 3px rgba(42,74,36,0.12)}
.lg-input::placeholder{color:#b0a898}

.lg-field-meta{display:flex;justify-content:flex-end;margin-top:5px}
.lg-forgot{font-size:12px;color:#7a8c72;background:none;border:none;cursor:pointer;transition:color 0.2s}
.lg-forgot:hover{color:#2a4a24}

.lg-error{
  background:#fdf0ee;border:1.5px solid #e8a898;border-radius:9px;
  padding:11px 14px;font-size:13px;color:#8b3a2a;margin-bottom:14px;
}

.lg-submit{
  width:100%;padding:14px;background:#2a4a24;border:none;border-radius:10px;
  font-size:15px;font-weight:700;font-family:'Inter',sans-serif;
  color:#f0ebe0;cursor:pointer;margin-top:6px;margin-bottom:22px;
  transition:background 0.2s,transform 0.1s;letter-spacing:0.01em;
}
.lg-submit:hover:not(:disabled){background:#1e3619}
.lg-submit:active:not(:disabled){transform:scale(0.99)}
.lg-submit:disabled{opacity:0.45;cursor:not-allowed}

.lg-footer{
  text-align:center;padding-top:20px;
  border-top:1px solid #ccc7ba;font-size:13px;color:#7a8c72;
}
.lg-footer button{
  background:none;border:none;color:#2a4a24;font-size:13px;
  font-weight:700;cursor:pointer;margin-left:6px;
  text-decoration:underline;text-underline-offset:3px;
}

@media(max-width:768px){
  .lg-root{flex-direction:column;min-height:100vh}
  .lg-photo{position:relative;width:100%;height:220px;flex-shrink:0}
  .lg-photo-overlay{background:linear-gradient(to bottom,rgba(0,0,0,0.2) 20%,#1c2a18 100%)}
  .lg-photo-copy{display:none}
  .lg-panel{padding:32px 22px 48px;align-items:flex-start;background:#eee9df}
  .lg-inner{max-width:100%}
  .lg-brand{margin-bottom:30px}
  .lg-heading{margin-bottom:24px}
  .lg-heading h2{font-size:22px}
}
@media(max-width:400px){
  .lg-panel{padding:28px 16px 44px}
}
`;

export default function Login() {
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { identifier, password });
      localStorage.setItem("token", res.data.access_token);
      nav("/dashboard");
    } catch {
      setError("Wrong email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") login(); };

  return (
    <>
      <style>{CSS}</style>
      <div className="lg-root">
        <aside className="lg-photo">
          <img src={bgPhoto} alt="" aria-hidden="true" />
          <div className="lg-photo-overlay" />
          <div className="lg-photo-copy">
            <h1 className="lg-tagline">Know your money.<br />Grow your hustle.</h1>
            <p className="lg-sub">Track income, expenses and profits — all in one simple place.</p>
            <div className="lg-stats">
              <div>
                <div className="lg-stat-n">12K+</div>
                <div className="lg-stat-l">Businesses</div>
              </div>
              <div>
                <div className="lg-stat-n">KES 4B</div>
                <div className="lg-stat-l">Tracked monthly</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="lg-panel">
          <div className="lg-inner">
            <div className="lg-brand">
              <div className="lg-brand-icon">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" stroke="#c8ddb8" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M10 2V18M2 7L18 13M18 7L2 13" stroke="#c8ddb8" strokeWidth="1" opacity="0.5"/>
                </svg>
              </div>
              <div>
                <div className="lg-brand-name">HustleIQ</div>
                <div className="lg-brand-sub">Business Platform</div>
              </div>
            </div>

            <div className="lg-heading">
              <h2>Welcome back</h2>
              <p>Sign in to see your business numbers</p>
            </div>

            <div className="lg-field">
              <label className="lg-label" htmlFor="identifier">Email or Phone</label>
              <input id="identifier" className="lg-input"
                placeholder="e.g. 0712 345 678"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={handleKey} autoComplete="username" />
            </div>

            <div className="lg-field">
              <label className="lg-label" htmlFor="password">Password</label>
              <input id="password" type="password" className="lg-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKey} autoComplete="current-password" />
              <div className="lg-field-meta">
                <button className="lg-forgot">Forgot password?</button>
              </div>
            </div>

            {error && <div className="lg-error">{error}</div>}

            <button className="lg-submit" onClick={login} disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>

            <div className="lg-footer">
              Don't have an account?
              <button onClick={() => nav("/register")}>Create one</button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}