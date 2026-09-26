"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { confirmPasswordReset } from "@/lib/api/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const linkInvalid = !uid || !token;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await confirmPasswordReset({ uid, token, newPassword: password });
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card w-full max-w-md p-6">
      <h1 className="text-2xl font-black">Reset Password</h1>
      {linkInvalid && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
          This reset link is missing required information. Please request a new one.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>
      )}
      {done ? (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-700">
          Password has been reset. Redirecting to login…
        </p>
      ) : (
        <>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-5 w-full rounded-lg border px-3 py-2"
            placeholder="New password"
            disabled={linkInvalid}
          />
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-3 w-full rounded-lg border px-3 py-2"
            placeholder="Confirm new password"
            disabled={linkInvalid}
          />
          <button
            type="submit"
            disabled={submitting || linkInvalid}
            className="mt-5 w-full rounded-lg bg-brand-600 px-5 py-3 font-black text-white disabled:opacity-60"
          >
            {submitting ? "Resetting…" : "Reset Password"}
          </button>
        </>
      )}
      <p className="mt-4 text-center text-sm">
        <Link className="font-bold text-brand-700" href="/login">
          Back to Login
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="container-shop grid min-h-[70vh] place-items-center py-4">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
