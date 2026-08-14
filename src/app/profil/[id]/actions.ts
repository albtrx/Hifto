"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function blockUser(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const blockedId = formData.get("userId") as string;

  if (!user) redirect("/login");
  if (user.id === blockedId) redirect(`/profil/${blockedId}`);

  const { error } = await supabase
    .from("blocks")
    .insert({ blocker_id: user.id, blocked_id: blockedId });

  if (error) {
    console.error("blockUser failed:", error);
  }

  redirect(`/profil/${blockedId}?blockiert=1`);
}

export async function unblockUser(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const blockedId = formData.get("userId") as string;

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", blockedId);

  if (error) {
    console.error("unblockUser failed:", error);
  }

  redirect("/profil/blockiert");
}
