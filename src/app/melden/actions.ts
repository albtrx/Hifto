"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitReport(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const requestId = (formData.get("requestId") as string) || null;
  const userId = (formData.get("userId") as string) || null;
  const reason = (formData.get("reason") as string)?.trim();
  const backTo = (formData.get("backTo") as string) || "/";

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(backTo)}`);
  }

  if (!reason || (!requestId && !userId)) {
    redirect(
      `/melden?${requestId ? `requestId=${requestId}` : `userId=${userId}`}&error=${encodeURIComponent("Bitte gib einen Grund an.")}`,
    );
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_request_id: requestId,
    reported_user_id: userId,
    reason,
  });

  if (error) {
    console.error("submitReport failed:", error);
  }

  redirect(`${backTo}?gemeldet=1`);
}
