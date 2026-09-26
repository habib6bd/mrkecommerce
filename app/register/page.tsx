"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/store/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register({ email, password, name });
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container-shop grid min-h-[70vh] place-items-center py-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-black">Create Account</h1>
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>
        )}
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-5 w-full rounded-lg border px-3 py-2"
          placeholder="Full name"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-3 w-full rounded-lg border px-3 py-2"
          placeholder="Email"
        />
        <input
          required
          minLength={8}
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
          {submitting ? "Creating account…" : "Register"}
        </button>
        <p className="mt-4 text-center text-sm">
          Already have account?{" "}
          <Link className="font-bold text-brand-700" href="/login">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
