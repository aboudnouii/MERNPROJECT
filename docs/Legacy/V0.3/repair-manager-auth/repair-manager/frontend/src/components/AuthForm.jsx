import { useState } from "react";

function AuthForm({ mode, onAuth, onSwitchMode, loading, error }) {
  const isSignup = mode === "signup";
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAuth(formData);
  };

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <p className="eyebrow">Secure Garage Dashboard</p>
        <h1>Repair Manager</h1>
        <p>Login or create an account to manage repair jobs, customers, vehicles, costs, and completion status.</p>
      </section>

      <section className="auth-card">
        <div className="panel-header">
          <div>
            <h2>{isSignup ? "Create Account" : "Login"}</h2>
            <p>{isSignup ? "Sign up as a garage staff member." : "Enter your account details."}</p>
          </div>
        </div>

        {error && <div className="alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              Full Name
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Aboud Noui"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              minLength="6"
              required
            />
          </label>

          <button className="btn primary full-auth-btn" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "No account yet?"}{" "}
          <button type="button" onClick={onSwitchMode}>
            {isSignup ? "Login" : "Sign up"}
          </button>
        </p>
      </section>
    </main>
  );
}

export default AuthForm;
