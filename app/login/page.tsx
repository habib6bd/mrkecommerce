"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/store/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      router.push(searchParams.get("next") || "/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card w-full max-w-md p-6">
      <h1 className="text-2xl font-black">Login</h1>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>
      )}
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-5 w-full rounded-lg border px-3 py-2"
        placeholder="Email"
      />
      <input
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-3 w-full rounded-lg border px-3 py-2"
        placeholder="Password"
        type="password"
      />
      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full rounded-lg bg-brand-600 px-5 py-3 font-black text-white disabled:opacity-60"
      >
        {submitting ? "Logging in…" : "Login"}
      </button>
      <p className="mt-4 text-center text-sm">
        No account?{" "}
        <Link className="font-bold text-brand-700" href="/register">
          Register
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="container-shop grid min-h-[70vh] place-items-center py-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
