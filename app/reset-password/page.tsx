"use client";

import { FormEvent, Suspense, useState } from "react";
import {
    ArrowLeft,
    ArrowUpRight,
    LockKeyhole,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!token) {
            setError("This password reset link is invalid or incomplete.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/users/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(
                    data.message || "Unable to reset your password. Please try again."
                );
                return;
            }

            setMessage(
                "Your password has been reset successfully. You can now sign in."
            );

            setPassword("");
            setConfirmPassword("");
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
                        PASSWORD RESET
                    </div>

                    <h1>
                        Create a new
                        <span>password.</span>
                    </h1>

                    <p className="auth-description">
                        Choose a strong password for your SKYLENT account.
                    </p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <label>
                            <span>New Password</span>

                            <div className="auth-input">
                                <LockKeyhole size={18} />

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Enter your new password"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                            </div>
                        </label>

                        <label>
                            <span>Confirm Password</span>

                            <div className="auth-input">
                                <LockKeyhole size={18} />

                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(event.target.value)
                                    }
                                    placeholder="Confirm your new password"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                            </div>
                        </label>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}

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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={null}>
            <ResetPasswordForm />
        </Suspense>
    );
}