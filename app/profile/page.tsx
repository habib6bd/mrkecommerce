"use client";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/store/AuthContext";

function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateProfile({ name, phone });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <main className="container-shop py-4">
      <div className="card mx-auto max-w-lg p-6">
        <h1 className="text-2xl font-black">My Profile</h1>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-bold">Email</label>
            <input
              disabled
              value={user.email}
              className="mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2 text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-bold">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>}
          {success && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-700">
              Profile updated.
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-brand-600 px-5 py-3 font-black text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileForm />
    </RequireAuth>
  );
}
