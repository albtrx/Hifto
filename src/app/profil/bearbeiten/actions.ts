"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const fullName = (formData.get("fullName") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim() || null;
  const avatar = formData.get("avatar") as File | null;

  let avatarUrl: string | undefined;

  if (avatar && avatar.size > 0) {
    const fileExt = avatar.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatar, { upsert: true });

    if (uploadError) {
      redirect(
        `/profil/bearbeiten?error=${encodeURIComponent("Bild konnte nicht hochgeladen werden.")}`,
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);
    avatarUrl = `${publicUrl}?t=${Date.now()}`;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      city,
      bio,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", user.id);

  if (error) {
    console.error("updateProfile failed:", error);
    redirect(
      `/profil/bearbeiten?error=${encodeURIComponent("Profil konnte nicht gespeichert werden.")}`,
    );
  }

  redirect(`/profil/${user.id}`);
}
