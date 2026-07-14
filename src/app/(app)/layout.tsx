import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.email_confirmed_at) {
    redirect(
      "/login?message=" +
        encodeURIComponent(
          "Please confirm your email first — check your inbox for the link",
        ),
    );
  }

  return <>{children}</>;
}
