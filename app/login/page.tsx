"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get("verified");
    const google = params.get("google");
    if (verified === "success") setError("Email verified. You can now sign in.");
    if (verified === "invalid") setError("This verification link is invalid or expired.");
    if (google === "not-configured") setError("Google sign-in is not configured yet.");
    if (google === "failed" || google === "invalid") setError("Google sign-in could not be completed.");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    setError("");

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-background-grid" />
      <div className="auth-orb auth-orb-cyan" />
      <div className="auth-orb auth-orb-violet" />

      <nav className="auth-nav">
        <Link href="/" className="auth-brand">
          <img
            src="/branding/skylent-navbar.png"
            alt="SKYLENT"
          />
        </Link>

        <Link href="/" className="auth-back">
          <ArrowLeft size={15} />
          Back to SKYLENT
        </Link>
      </nav>

      <section className="auth-center">
        <div className="auth-card">
          <div className="auth-card-glow" />

          <div className="auth-symbol">
            <img
              src="/branding/skylent-symbol.png"
              alt="SKYLENT symbol"
            />
          </div>

          <div className="auth-eyebrow">
            <span className="auth-dot" />
            WELCOME BACK
          </div>

          <h1>
            Welcome back to
            <span>SKYLENT.</span>
          </h1>

          <p className="auth-description">
            Sign in and continue building your future with
            practical AI, real-world projects and
            career-ready skills.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              <span>Email</span>

              <div className="auth-input">
                <Mail size={18} />

                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </label>

            <label>
              <span>Password</span>

              <div className="auth-input">
                <LockKeyhole size={18} />

                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}

              {!loading && <ArrowUpRight size={17} />}
            </button>
          </form>

          {error && (
            <div className="auth-message" role="alert">
              <span>{error}</span>
              {error === "Account not found. Please create an account." && (
                <Link href="/signup">Create Account</Link>
              )}
            </div>
          )}

          <div className="auth-divider"><span /><small>OR</small><span /></div>

          <a href="/api/auth/google" className="auth-google-button">
            <span className="google-mark" aria-hidden="true">G</span>
            Continue with Google
          </a>

          <div className="auth-divider">
            <span /><small>NEW TO SKYLENT?</small><span />
          </div>

          <Link href="/signup" className="auth-login-link">
            Don't have an account? Create account
            <ArrowUpRight size={16} />
          </Link>

          <div className="auth-microcopy">
            <span>AI</span>
            <i />
            <span>BUILD</span>
            <i />
            <span>LEARN</span>
            <i />
            <span>FUTURE</span>
          </div>
        </div>
      </section>

      <footer className="auth-footer">
        © {new Date().getFullYear()} SKYLENT · Learn Today. Lead Tomorrow.
      </footer>
    </main>
  );
}