"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/store/AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
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

  return <>{children}</>;
}
