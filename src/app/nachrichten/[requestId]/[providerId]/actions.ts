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
  const providerId = formData.get("providerId") as string;
  const body = (formData.get("body") as string)?.trim();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/nachrichten/${requestId}/${providerId}`)}`,
    );
  }

  const tooManyMessages = await isRateLimited(
    supabase,
    "messages",
    "sender_id",
    user.id,
    100,
  );

  if (tooManyMessages) {
    redirect(
      `/nachrichten/${requestId}/${providerId}?error=${encodeURIComponent("Du hast heute schon zu viele Nachrichten geschickt. Versuch es morgen wieder.")}`,
    );
  }

  if (body) {
    const { error } = await supabase.from("messages").insert({
      request_id: requestId,
      provider_id: providerId,
      sender_id: user.id,
      body,
    });

    if (error) {
      console.error("sendMessage failed:", error);
      redirect(
        `/nachrichten/${requestId}/${providerId}?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  redirect(`/nachrichten/${requestId}/${providerId}`);
}
