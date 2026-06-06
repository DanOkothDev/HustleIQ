import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const bgPhoto = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;width:100%;font-family:'Inter',sans-serif}

.rg-root{display:flex;min-height:100vh;width:100%;background:#1c2a18}

.rg-photo{width:42%;flex-shrink:0;position:sticky;top:0;height:100vh;overflow:hidden}
.rg-photo img{width:100%;height:100%;object-fit:cover;filter:brightness(0.45) saturate(0.4)}
.rg-photo-overlay{
  position:absolute;inset:0;
  background:linear-gradient(160deg,rgba(18,34,14,0.55) 0%,rgba(34,60,22,0.6) 100%);
}
.rg-photo-copy{position:absolute;bottom:52px;left:44px;right:32px}
.rg-tagline{font-size:32px;font-weight:700;color:#f0ebe0;line-height:1.2;margin-bottom:12px}
.rg-sub{font-size:14px;color:rgba(240,235,224,0.65);line-height:1.65}
.rg-perks{
  margin-top:26px;padding-top:22px;
  border-top:1px solid rgba(255,255,255,0.15);
  display:flex;flex-direction:column;gap:10px;
}
.rg-perk{display:flex;align-items:center;gap:10px;font-size:13px;color:rgba(240,235,224,0.8)}
.rg-perk-dot{width:7px;height:7px;border-radius:50%;background:#7ec896;flex-shrink:0}

.rg-panel{
  flex:1;display:flex;align-items:flex-start;justify-content:center;
  background:#eee9df;padding:44px 48px;overflow-y:auto;
}
.rg-inner{width:100%;max-width:440px}

.rg-brand{display:flex;align-items:center;gap:11px;margin-bottom:34px}
.rg-brand-icon{
  width:40px;height:40px;border-radius:11px;background:#2a4a24;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.rg-brand-icon svg{width:22px;height:22px}
.rg-brand-name{font-size:20px;font-weight:700;color:#1c2a18;letter-spacing:-0.01em;line-height:1}
.rg-brand-sub{font-size:11px;color:#7a8c72;letter-spacing:0.05em;margin-top:2px}

.rg-heading{margin-bottom:26px}
.rg-heading h2{font-size:24px;font-weight:700;color:#1c2a18;letter-spacing:-0.02em;line-height:1.1}
.rg-heading p{font-size:14px;color:#7a8c72;margin-top:6px}

.rg-section{
  font-size:11px;font-weight:700;color:#2a4a24;
  letter-spacing:0.09em;text-transform:uppercase;
  margin-bottom:13px;margin-top:22px;
  display:flex;align-items:center;gap:9px;
}
.rg-section::after{content:'';flex:1;height:1px;background:#ccc7ba}
.rg-section:first-of-type{margin-top:0}

.rg-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}
.rg-field.full{grid-column:span 2}
.rg-field{margin-bottom:14px}
.rg-label{display:block;font-size:12px;font-weight:600;color:#3d5238;margin-bottom:5px;letter-spacing:0.03em}
.rg-input{
  width:100%;padding:12px 14px;
  border:1.5px solid #ccc7ba;border-radius:10px;
  font-size:14px;font-family:'Inter',sans-serif;
  color:#1c2a18;background:#f5f1e9;
  outline:none;transition:border-color 0.2s,box-shadow 0.2s;
}
.rg-input:focus{border-color:#2a4a24;box-shadow:0 0 0 3px rgba(42,74,36,0.12)}
.rg-input::placeholder{color:#b0a898}

.rg-error{
  background:#fdf0ee;border:1.5px solid #e8a898;border-radius:9px;
  padding:11px 14px;font-size:13px;color:#8b3a2a;margin-bottom:14px;
}

.rg-submit{
  width:100%;padding:14px;background:#2a4a24;border:none;border-radius:10px;
  font-size:15px;font-weight:700;font-family:'Inter',sans-serif;
  color:#f0ebe0;cursor:pointer;margin-top:8px;margin-bottom:22px;
  transition:background 0.2s,transform 0.1s;
}
.rg-submit:hover:not(:disabled){background:#1e3619}
.rg-submit:active:not(:disabled){transform:scale(0.99)}
.rg-submit:disabled{opacity:0.45;cursor:not-allowed}

.rg-footer{
  text-align:center;padding-top:18px;
  border-top:1px solid #ccc7ba;font-size:13px;color:#7a8c72;
}
.rg-footer button{
  background:none;border:none;color:#2a4a24;font-size:13px;
  font-weight:700;cursor:pointer;margin-left:6px;
  text-decoration:underline;text-underline-offset:3px;
}

@media(max-width:768px){
  .rg-root{flex-direction:column}
  .rg-photo{position:relative;width:100%;height:200px;flex-shrink:0}
  .rg-photo-overlay{background:linear-gradient(to bottom,rgba(0,0,0,0.2) 20%,#1c2a18 100%)}
  .rg-photo-copy{display:none}
  .rg-panel{padding:28px 20px 52px;align-items:flex-start;background:#eee9df}
  .rg-inner{max-width:100%}
  .rg-brand{margin-bottom:26px}
  .rg-grid{grid-template-columns:1fr}
  .rg-field.full{grid-column:span 1}
}
@media(max-width:400px){
  .rg-panel{padding:24px 14px 48px}
}
`;

const SECTIONS = [
  {
    title: "Business",
    fields: [
      { name: "business_name", label: "Business Name", type: "text", full: true },
    ],
  },
  {
    title: "Your Details",
    fields: [
      { name: "first_name",   label: "First Name",  type: "text" },
      { name: "second_name",  label: "Last Name",   type: "text" },
      { name: "email",        label: "Email",       type: "email", full: true },
      { name: "phone_number", label: "Phone Number",type: "tel",   full: true },
    ],
  },
  {
    title: "Password",
    fields: [
      { name: "password",         label: "Password",        type: "password" },
      { name: "confirm_password", label: "Confirm Password",type: "password" },
    ],
  },
];

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    business_name:"", first_name:"", second_name:"",
    email:"", phone_number:"", password:"", confirm_password:"",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const register = async () => {
    setError("");
    if (form.password !== form.confirm_password) {
      setError("Passwords don't match. Please check and try again.");
      return;
    }
    if (!form.email) {
      setError("Email is required.");
      return;
    }

    if (!form.phone_number) {
      setError("Phone number is required.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      nav("/");
    } catch {
      setError("Could not create your account. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="rg-root">
        <aside className="rg-photo">
          <img src={bgPhoto} alt="" aria-hidden="true" />
          <div className="rg-photo-overlay" />
          <div className="rg-photo-copy">
            <h1 className="rg-tagline">Start tracking<br />your money today.</h1>
            <p className="rg-sub">Join thousands of businesses already using HustleIQ to grow.</p>
            <div className="rg-perks">
              <div className="rg-perk"><div className="rg-perk-dot"/>Free to get started</div>
              <div className="rg-perk"><div className="rg-perk-dot"/>Set up in under 2 minutes</div>
              <div className="rg-perk"><div className="rg-perk-dot"/>Works on phone and computer</div>
            </div>
          </div>
        </aside>

        <main className="rg-panel">
          <div className="rg-inner">
            <div className="rg-brand">
              <div className="rg-brand-icon">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" stroke="#c8ddb8" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M10 2V18M2 7L18 13M18 7L2 13" stroke="#c8ddb8" strokeWidth="1" opacity="0.5"/>
                </svg>
              </div>
              <div>
                <div className="rg-brand-name">HustleIQ</div>
                <div className="rg-brand-sub">Business Platform</div>
              </div>
            </div>

            <div className="rg-heading">
              <h2>Create your account</h2>
              <p>It only takes a couple of minutes</p>
            </div>

            {SECTIONS.map(({ title, fields }) => (
              <div key={title}>
                <div className="rg-section">{title}</div>
                <div className="rg-grid">
                  {fields.map(({ name, label, type, full }) => (
                    <div key={name} className={`rg-field${full ? " full" : ""}`}>
                      <label className="rg-label" htmlFor={name}>{label}</label>
                      <input id={name} name={name} type={type}
                        className="rg-input" placeholder="—"
                        value={form[name]} onChange={handleChange}
                        autoComplete={type === "password" ? "new-password" : "off"} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {error && <div className="rg-error">{error}</div>}

            <button className="rg-submit" onClick={register} disabled={loading}>
              {loading ? "Creating Account…" : "Create Account →"}
            </button>

            <div className="rg-footer">
              Already have an account?
              <button onClick={() => nav("/")}>Sign in</button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}