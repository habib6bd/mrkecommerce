import Link from "next/link";
export default function LoginPage() {
  return (
    <main className="container-shop grid min-h-[70vh] place-items-center py-4">
      <form className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-black">Login</h1>
        <input className="mt-5 w-full rounded-lg border px-3 py-2" placeholder="Email" />
        <input
          className="mt-3 w-full rounded-lg border px-3 py-2"
          placeholder="Password"
          type="password"
        />
        <button className="mt-5 w-full rounded-lg bg-brand-600 px-5 py-3 font-black text-white">
          Login
        </button>
        <p className="mt-4 text-center text-sm">
          No account?{" "}
          <Link className="font-bold text-brand-700" href="/register">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
}
