"use client";
import Link from "next/link";
import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { requestPasswordReset } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container-shop grid min-h-[70vh] place-items-center py-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-black">Forgot Password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your account email and we&apos;ll send you a link to reset your password.
        </p>
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>
        )}
        {sent ? (
          <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-700">
            If an account exists for that email, a password reset link has been sent.
          </p>
        ) : (
          <>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-5 w-full rounded-lg border px-3 py-2"
              placeholder="Email"
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-lg bg-brand-600 px-5 py-3 font-black text-white disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send Reset Link"}
            </button>
          </>
        )}
        <p className="mt-4 text-center text-sm">
          <Link className="font-bold text-brand-700" href="/login">
            Back to Login
          </Link>
        </p>
      </form>
    </main>
  );
}
