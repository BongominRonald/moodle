import React, { useState } from "react";
import {
  Store, Eye, EyeOff, ShieldCheck, User, LogIn
} from "lucide-react";

interface LoginPageProps {
  onLogin: (role: "admin" | "vendor", user: { name: string; email: string; id: string }) => void;
}

const DEMO_USERS = {
  admin: { email: "admin@mbararamarket.ug", password: "Admin@123", name: "John Mugisha", id: "ADM001" },
  vendor: { email: "vendor@mbararamarket.ug", password: "Vendor@123", name: "Sarah Nakato", id: "VND001" },
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<"admin" | "vendor">("vendor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const demo = DEMO_USERS[role];
      if (email === demo.email && password === demo.password) {
        onLogin(role, { name: demo.name, email: demo.email, id: demo.id });
      } else {
        setError("Invalid email or password. Check demo credentials below.");
      }
    }, 900);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        {/* MVMS Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, hsl(152, 60%, 25%), hsl(38, 90%, 50%))" }}>
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">MVMS</h1>
          <p className="text-muted-foreground text-sm">Mbarara City Market</p>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Welcome Back</h2>
        <p className="text-muted-foreground text-sm mb-8 text-center">Sign in to access your market dashboard</p>

        {/* Role Selection */}
        <div className="mb-6">
          <p className="text-sm font-medium text-foreground mb-3">Select Your Role</p>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              role === "vendor" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`} onClick={() => setRole("vendor")}>
              <input type="radio" name="role" value="vendor" className="sr-only" checked={role === "vendor"} onChange={() => setRole("vendor")} />
              <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: "hsl(150, 15%, 93%)" }}>
                <User size={20} style={{ color: "hsl(150, 10%, 45%)" }} />
              </div>
              <span className="text-sm font-medium text-foreground">Market Vendor</span>
            </label>
            <label className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              role === "admin" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`} onClick={() => setRole("admin")}>
              <input type="radio" name="role" value="admin" className="sr-only" checked={role === "admin"} onChange={() => setRole("admin")} />
              <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: "hsl(210, 15%, 93%)" }}>
                <ShieldCheck size={20} style={{ color: "hsl(210, 10%, 45%)" }} />
              </div>
              <span className="text-sm font-medium text-foreground">Market Admin</span>
            </label>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            <span>{loading ? "Signing In..." : "Sign In"}</span>
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-3 text-sm">Demo Credentials</h3>
          <div className="space-y-3 text-xs">
            <div>
              <p className="font-medium text-foreground mb-1">Market Vendor:</p>
              <p className="text-muted-foreground">Email: vendor@mbararamarket.ug</p>
              <p className="text-muted-foreground">Password: Vendor@123</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Market Admin:</p>
              <p className="text-muted-foreground">Email: admin@mbararamarket.ug</p>
              <p className="text-muted-foreground">Password: Admin@123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-3"></div>
            <p className="text-muted-foreground text-sm">Signing you in…</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(var(--primary))" }}
            >
              <Store size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">MVMS</h1>
              <p className="text-muted-foreground text-xs">Mbarara City Market</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome Back</h2>
          <p className="text-muted-foreground text-sm mb-7">Sign in to access your market dashboard</p>

          {/* Role Selection */}
          <div className="mb-6">
            <p className="form-label">Select Your Role</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: "vendor" as const, label: "Market Vendor", icon: User, desc: "Sell & manage stalls" },
                { val: "admin" as const, label: "Market Admin", icon: ShieldCheck, desc: "Manage all operations" },
              ].map(r => (
                <label
                  key={r.val}
                  className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    role === r.val
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.val}
                    checked={role === r.val}
                    onChange={() => { setRole(r.val); setError(""); setEmail(""); setPassword(""); }}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2 w-full">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        role === r.val ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <r.icon size={16} className={role === r.val ? "text-white" : "text-muted-foreground"} />
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ml-auto transition-all ${
                        role === r.val ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    >
                      {role === r.val && (
                        <div className="w-full h-full rounded-full scale-50 bg-white" />
                      )}
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${role === r.val ? "text-primary" : "text-foreground"}`}>
                    {r.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{r.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder={`Enter ${role} email`}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="form-input pr-11"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPw(v => !v)}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base"
              style={{ background: "hsl(var(--primary))" }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
                  </svg>
                  Signing In…
                </span>
              ) : (
                <span className="flex items-center gap-2"><LogIn size={18} /> Sign In</span>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded-xl border border-dashed border-border bg-muted/40">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Demo Credentials</p>
            <div className="space-y-1.5">
              <div className="text-xs text-foreground flex gap-2 flex-wrap">
                <span className="badge-success">Admin</span>
                <span className="text-muted-foreground">admin@mbararamarket.ug / Admin@123</span>
              </div>
              <div className="text-xs text-foreground flex gap-2 flex-wrap">
                <span className="badge-info">Vendor</span>
                <span className="text-muted-foreground">vendor@mbararamarket.ug / Vendor@123</span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Mbarara City Market Authority — © 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
