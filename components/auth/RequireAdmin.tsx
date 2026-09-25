"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/store/AuthContext";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/admin");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="container-shop py-4">
        <div className="card grid h-64 place-items-center">
          <p className="font-bold text-slate-500">Loading…</p>
        </div>
      </main>
    );
  }

  if (!user.isStaff) {
    return (
      <main className="container-shop py-4">
        <div className="card grid h-64 place-items-center gap-3 text-center">
          <p className="text-xl font-black">Not authorized</p>
          <p className="text-sm text-slate-500">
            This area is for store admins only.
          </p>
          <Link href="/" className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-bold text-white">
            Back to store
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
