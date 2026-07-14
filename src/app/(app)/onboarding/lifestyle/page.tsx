import { redirect } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { LifestyleForm } from "./LifestyleForm";

export default async function LifestylePage() {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const [profileRes, lifestyleRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, onboarding_completed_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("profile_lifestyle")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle(),
  ]);

  if (!profileRes.data) redirect("/onboarding/basic-info");
  const ls = lifestyleRes.data;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl">Life at home</h2>
        <p className="text-stone">
          The practical stuff — so nobody's surprised three weeks in. These
          answers shape your compatibility more than anything else.
        </p>
      </div>
      <LifestyleForm
        editing={profileRes.data.onboarding_completed_at != null}
        defaults={{
          pets: ls?.pets ?? null,
          smoking: ls?.smoking ?? null,
          cleanliness_level: ls?.cleanliness_level ?? null,
          schedule_type: ls?.schedule_type ?? null,
          noise_tolerance: ls?.noise_tolerance ?? null,
          overnight_guests_frequency: ls?.overnight_guests_frequency ?? null,
          overnight_guests_notice: ls?.overnight_guests_notice ?? null,
          dating_while_cohabiting_preference:
            ls?.dating_while_cohabiting_preference ?? null,
          hosting_frequency: ls?.hosting_frequency ?? null,
          shared_space_guest_policy: ls?.shared_space_guest_policy ?? "",
        }}
      />
    </section>
  );
}
