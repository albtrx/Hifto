"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const requestId = formData.get("requestId") as string;
  const responderId = formData.get("responderId") as string;
  const body = (formData.get("body") as string)?.trim();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/nachrichten/${requestId}/${responderId}`)}`,
    );
  }

  const tooManyMessages = await isRateLimited(
    supabase,
    "messages",
    "sender_id",
    user.id,
    100,
  );

  if (body && !tooManyMessages) {
    const { error } = await supabase.from("messages").insert({
      request_id: requestId,
      responder_id: responderId,
      sender_id: user.id,
      body,
    });

    if (error) {
      console.error("sendMessage failed:", error);
    }
  }

  redirect(`/nachrichten/${requestId}/${responderId}`);
}
