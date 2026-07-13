import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KidsForm } from "./KidsForm";

export default async function KidsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, kidsRes] = await Promise.all([
    supabase.from("profiles").select("id").eq("id", user.id).maybeSingle(),
    supabase
      .from("profile_kids_custody")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle(),
  ]);

  if (!profileRes.data) redirect("/onboarding/basic-info");
  const kids = kidsRes.data;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl">Kids and family</h2>
        <p className="text-stone">
          Family rhythms shape a home. This helps everyone find an arrangement
          that genuinely works.
        </p>
      </div>
      <KidsForm
        defaults={{
          has_kids: kids ? kids.has_kids : null,
          num_kids: kids?.num_kids ?? null,
          kid_ages: kids?.kid_ages ?? [],
          custody_arrangement: kids?.custody_arrangement ?? null,
          typical_schedule: kids?.typical_schedule ?? "",
          roommate_kids_preference: kids?.roommate_kids_preference ?? null,
        }}
      />
    </section>
  );
}
