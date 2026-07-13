import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-mist/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-heading text-2xl text-sage-dark">
            CoHome
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="/about" className="transition-colors hover:text-sage-dark">
              Our story
            </Link>
            <Link href="/guidelines" className="transition-colors hover:text-sage-dark">
              Safety
            </Link>
            {user ? (
              <Link
                href="/browse"
                className="rounded-full bg-sage px-4 py-2 text-white transition-colors hover:bg-sage-dark"
              >
                Open CoHome
              </Link>
            ) : (
              <>
                <Link href="/login" className="transition-colors hover:text-sage-dark">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-sage px-4 py-2 text-white transition-colors hover:bg-sage-dark"
                >
                  Join CoHome
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-mist/60 bg-linen">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-stone sm:flex-row sm:items-center sm:justify-between">
          <p>CoHome — shared homes, on your terms. Greater Vancouver, BC.</p>
          <nav className="flex gap-4">
            <Link href="/about" className="hover:text-charcoal">
              Our story
            </Link>
            <Link href="/guidelines" className="hover:text-charcoal">
              Safety &amp; guidelines
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
