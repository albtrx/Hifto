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

export async function closeRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const requestId = formData.get("requestId") as string;
  const helperId = (formData.get("helperId") as string) || null;

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("requests")
    .update({ status: "closed", helper_id: helperId })
    .eq("id", requestId)
    .eq("user_id", user.id);

  if (error) {
    console.error("closeRequest failed:", error);
  }

  redirect(`/anfrage/${requestId}`);
}

export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const requestId = formData.get("requestId") as string;
  const revieweeId = formData.get("revieweeId") as string;
  const rating = Number(formData.get("rating"));
  const reliability = formData.get("reliability")
    ? Number(formData.get("reliability"))
    : null;
  const friendliness = formData.get("friendliness")
    ? Number(formData.get("friendliness"))
    : null;
  const quality = formData.get("quality")
    ? Number(formData.get("quality"))
    : null;
  const comment = (formData.get("comment") as string)?.trim() || null;

  if (!user) redirect("/login");

  const { error } = await supabase.from("reviews").insert({
    request_id: requestId,
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    rating,
    reliability,
    friendliness,
    quality,
    comment,
  });

  if (error) {
    console.error("submitReview failed:", error);
    redirect(
      `/anfrage/${requestId}?error=${encodeURIComponent("Bewertung konnte nicht gespeichert werden.")}`,
    );
  }

  redirect(`/anfrage/${requestId}?bewertet=1`);
}
