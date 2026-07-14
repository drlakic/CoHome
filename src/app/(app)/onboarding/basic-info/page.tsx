import { redirect } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { BasicInfoForm } from "./BasicInfoForm";

export default async function BasicInfoPage() {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, birthdate, gender, bio, relationship_status, photos, onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl">About you</h2>
        <p className="text-stone">
          The basics — who you are and how you'd like to come across.
        </p>
      </div>
      <BasicInfoForm
        editing={profile?.onboarding_completed_at != null}
        defaults={{
          name: profile?.name ?? "",
          birthdate: profile?.birthdate ?? "",
          gender: profile?.gender ?? "",
          bio: profile?.bio ?? "",
          relationship_status: profile?.relationship_status ?? null,
          photos: profile?.photos ?? [],
        }}
      />
    </section>
  );
}
