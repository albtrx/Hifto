"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function respondToRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const requestId = formData.get("requestId") as string;
  const message = (formData.get("message") as string)?.trim();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/anfrage/${requestId}`)}`);
  }

  if (!message) {
    redirect(
      `/anfrage/${requestId}?error=${encodeURIComponent("Bitte schreib eine kurze Nachricht.")}`,
    );
  }

  const { error } = await supabase.from("responses").insert({
    request_id: requestId,
    responder_id: user.id,
    message,
  });

  if (error) {
    console.error("respondToRequest failed:", error);
    redirect(
      `/anfrage/${requestId}?error=${encodeURIComponent("Antwort konnte nicht gesendet werden.")}`,
    );
  }

  redirect(`/anfrage/${requestId}?erfolg=1`);
}
