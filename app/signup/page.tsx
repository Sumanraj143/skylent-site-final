"use client";

import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const confirmation = String(formData.get("confirmation") || "");
    setMessage("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim().toLowerCase())) {
      setMessage("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (password !== confirmation) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Unable to create account.");
        return;
      }

      setMessage(data.message);
    } catch {
      setMessage("Something went wrong. Please try again.");
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
            JOIN SKYLENT
          </div>

          <h1>
            Create your
            <span>SKYLENT account.</span>
          </h1>

          <p className="auth-description">
            Start building your future with practical AI,
            real-world projects and career-ready skills.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              <span>Full name</span>

              <div className="auth-input">
                <UserRound size={18} />

                <input
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  autoComplete="name"
                />
              </div>
            </label>

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
                  placeholder="Create a password"
                  required
                  minLength={6}
                  autoComplete="new-password"
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

            <label>
              <span>Confirm password</span>

              <div className="auth-input">
                <LockKeyhole size={18} />
                <input
                  name="confirmation"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </label>

            <div className="auth-security">
              <CheckCircle2 size={15} />
              <span>Your password is securely encrypted before storage.</span>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}

              {!loading && <ArrowUpRight size={17} />}
            </button>
          </form>

          {message && <div className="auth-message" role="alert">{message}</div>}

          <div className="auth-divider"><span /><small>OR</small><span /></div>

          <a href="/api/auth/google" className="auth-google-button">
            <span className="google-mark" aria-hidden="true">G</span>
            Continue with Google
          </a>

          <div className="auth-divider">
            <span />
            <small>ALREADY PART OF SKYLENT?</small>
            <span />
          </div>

          <Link href="/login" className="auth-login-link">
            Sign in to your account
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