"use client";

import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Mail,
} from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "");

    try {
      const response = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      setMessage(
        "If an account exists with this email, a password reset link has been sent."
      );

      form.reset();
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

        <Link href="/login" className="auth-back">
          <ArrowLeft size={15} />
          Back to Login
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
            ACCOUNT RECOVERY
          </div>

          <h1>
            Forgot your
            <span>password?</span>
          </h1>

          <p className="auth-description">
            No worries. Enter your email address and we&apos;ll
            send you a secure link to create a new password.
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

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}

              {!loading && <ArrowUpRight size={17} />}
            </button>
          </form>

          {message && (
            <div className="auth-message" role="status">
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="auth-message" role="alert">
              <span>{error}</span>
            </div>
          )}

          <div className="auth-divider">
            <span />
            <small>REMEMBERED YOUR PASSWORD?</small>
            <span />
          </div>

          <Link href="/login" className="auth-login-link">
            Back to Sign In
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