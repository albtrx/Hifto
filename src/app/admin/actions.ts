"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht eingeloggt.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Kein Admin-Zugriff.");

  return supabase;
}

export async function setUserBanned(formData: FormData) {
  const supabase = await requireAdmin();
  const userId = formData.get("userId") as string;
  const banned = formData.get("banned") === "1";

  await supabase.from("profiles").update({ is_banned: banned }).eq("id", userId);
  revalidatePath("/admin/nutzer");
}

export async function setRequestHidden(formData: FormData) {
  const supabase = await requireAdmin();
  const requestId = formData.get("requestId") as string;
  const hidden = formData.get("hidden") === "1";

  await supabase
    .from("requests")
    .update({ is_hidden: hidden })
    .eq("id", requestId);
  revalidatePath("/admin/anfragen");
}

export async function deleteRequestAdmin(formData: FormData) {
  const supabase = await requireAdmin();
  const requestId = formData.get("requestId") as string;

  await supabase.from("requests").delete().eq("id", requestId);
  revalidatePath("/admin/anfragen");
}

export async function setReportStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const reportId = formData.get("reportId") as string;
  const status = formData.get("status") as string;

  await supabase.from("reports").update({ status }).eq("id", reportId);
  revalidatePath("/admin/meldungen");
}
