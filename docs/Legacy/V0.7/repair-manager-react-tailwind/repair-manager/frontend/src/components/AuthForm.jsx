import { useState } from "react";

function AuthForm({ mode, onAuth, onSwitchMode, onOpenTrack, loading, error }) {
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
        <p className="eyebrow">Auto Garage Management</p>
        <h1>Repair<br />Manager</h1>
        <p>Your complete solution for managing customers, vehicles, repair jobs, costs, and real-time status updates—all from one secure dashboard.</p>
        <div className="auth-features">
          <div className="auth-feature">
            <span className="auth-feature-dot"></span>
            JWT-secured staff dashboard
          </div>
          <div className="auth-feature">
            <span className="auth-feature-dot"></span>
            Full repair lifecycle tracking
          </div>
          <div className="auth-feature">
            <span className="auth-feature-dot"></span>
            Customer self-service tracking portal
          </div>
          <div className="auth-feature">
            <span className="auth-feature-dot"></span>
            Cost estimation & revenue overview
          </div>
        </div>
      </section>

      <section className="auth-card">
        <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
        <p>{isSignup ? "Sign up as a garage staff member." : "Enter your credentials to access the dashboard."}</p>

        {error && <div className="alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              Full Name
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ahmed Mansouri"
                required
              />
            </label>
          )}
          <label>
            Email Address
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@garage.com"
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
            {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "No account yet?"}{" "}
          <button type="button" onClick={onSwitchMode}>
            {isSignup ? "Sign in" : "Sign up"}
          </button>
        </p>

        <div className="customer-entry">
          <span>Are you a customer?</span>
          <button type="button" onClick={onOpenTrack}>Track your repair →</button>
        </div>
      </section>
    </main>
  );
}

export default AuthForm;
