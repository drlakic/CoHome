import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { moderateProfilePhoto } from "@/lib/moderation/photo";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

// Photos are uploaded through this route — never straight to storage — so
// moderation runs before a photo ever has a public URL.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Your session expired — please sign in again" },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = formData.get("photo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Photos need to be JPEG, PNG, or WebP" },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Each photo needs to be under 8 MB" },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  const verdict = await moderateProfilePhoto(bytes, file.type);
  if (!verdict.allowed) {
    return NextResponse.json({ error: verdict.message }, { status: 422 });
  }

  // Runs as the signed-in user: storage RLS restricts writes to their folder.
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(path, bytes, { contentType: file.type });
  if (uploadError) {
    return NextResponse.json(
      { error: "That upload didn't go through — please try again" },
      { status: 500 },
    );
  }

  const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
