"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";

export async function submitOffer(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const requestId = formData.get("requestId") as string;
  const priceRaw = formData.get("price") as string;
  const availability = (formData.get("availability") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();
  const estimatedDuration =
    (formData.get("estimatedDuration") as string)?.trim() || null;

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/anfrage/${requestId}`)}`);
  }

  if (await isRateLimited(supabase, "offers", "provider_id", user.id, 30)) {
    redirect(
      `/anfrage/${requestId}?error=${encodeURIComponent("Du hast heute schon zu viele Angebote geschickt. Versuch es morgen wieder.")}`,
    );
  }

  const price = priceRaw ? Number(priceRaw) : null;

  if (!price || !availability || !message) {
    redirect(
      `/anfrage/${requestId}?error=${encodeURIComponent("Bitte fülle Preis, Verfügbarkeit und Nachricht aus.")}`,
    );
  }

  const { error } = await supabase.from("offers").insert({
    request_id: requestId,
    provider_id: user.id,
    price,
    availability,
    message,
    estimated_duration: estimatedDuration,
  });

  if (error) {
    console.error("submitOffer failed:", error);
    redirect(
      `/anfrage/${requestId}?error=${encodeURIComponent("Angebot konnte nicht gesendet werden.")}`,
    );
  }

  redirect(`/anfrage/${requestId}?erfolg=1`);
}

export async function acceptOffer(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const requestId = formData.get("requestId") as string;
  const offerId = formData.get("offerId") as string;
  const providerId = formData.get("providerId") as string;

  if (!user) redirect("/login");

  const { error: acceptError } = await supabase
    .from("offers")
    .update({ status: "accepted" })
    .eq("id", offerId)
    .eq("request_id", requestId);

  if (acceptError) {
    console.error("acceptOffer failed:", acceptError);
    redirect(`/anfrage/${requestId}`);
  }

  await supabase
    .from("offers")
    .update({ status: "rejected" })
    .eq("request_id", requestId)
    .neq("id", offerId);

  const { error: requestError } = await supabase
    .from("requests")
    .update({ status: "assigned", helper_id: providerId })
    .eq("id", requestId)
    .eq("user_id", user.id);

  if (requestError) {
    console.error("acceptOffer request update failed:", requestError);
  }

  redirect(`/anfrage/${requestId}`);
}

export async function closeRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const requestId = formData.get("requestId") as string;

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("requests")
    .update({ status: "closed" })
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
