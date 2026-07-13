import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold">Log in</h1>

      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded-xl border border-mist bg-linen px-4 py-2.5 outline-none focus:border-sage"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="rounded-xl border border-mist bg-linen px-4 py-2.5 outline-none focus:border-sage"
        />
        <button
          formAction={login}
          className="rounded-full bg-sage px-5 py-2.5 font-medium text-white transition-colors hover:bg-sage-dark"
        >
          Log in
        </button>
      </form>

      <p className="text-sm">
        No account?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
