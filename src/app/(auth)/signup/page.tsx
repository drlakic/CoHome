import Link from "next/link";
import { signup } from "../login/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold">Sign up</h1>

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
          minLength={6}
          className="rounded-xl border border-mist bg-linen px-4 py-2.5 outline-none focus:border-sage"
        />
        <input
          name="confirm_password"
          type="password"
          placeholder="Confirm password"
          required
          minLength={6}
          className="rounded-xl border border-mist bg-linen px-4 py-2.5 outline-none focus:border-sage"
        />
        <button
          formAction={signup}
          className="rounded-full bg-sage px-5 py-2.5 font-medium text-white transition-colors hover:bg-sage-dark"
        >
          Sign up
        </button>
      </form>

      <p className="text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
