"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/lib/categories";

export async function createRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const category = formData.get("category") as string;
  const location = (formData.get("location") as string)?.trim();
  const neededAtRaw = formData.get("neededAt") as string;
  const budgetAmountRaw = formData.get("budgetAmount") as string;
  const budgetCurrency = (formData.get("budgetCurrency") as string) || "CHF";
  const image = formData.get("image") as File | null;

  if (!title || !description || !location) {
    redirect(
      `/anfrage/neu?error=${encodeURIComponent("Bitte fülle alle Pflichtfelder aus.")}`,
    );
  }

  if (!categories.some((c) => c.slug === category)) {
    redirect(`/anfrage/neu?error=${encodeURIComponent("Ungültige Kategorie.")}`);
  }

  let imageUrl: string | null = null;

  if (image && image.size > 0) {
    const fileExt = image.name.split(".").pop();
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("request-images")
      .upload(filePath, image);

    if (uploadError) {
      redirect(
        `/anfrage/neu?error=${encodeURIComponent("Bild konnte nicht hochgeladen werden.")}`,
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("request-images").getPublicUrl(filePath);
    imageUrl = publicUrl;
  }

  const { data: newRequest, error } = await supabase
    .from("requests")
    .insert({
      user_id: user.id,
      title,
      description,
      category,
      location,
      needed_at: neededAtRaw || null,
      budget_amount: budgetAmountRaw ? Number(budgetAmountRaw) : null,
      budget_currency: budgetCurrency,
      image_url: imageUrl,
    })
    .select("id")
    .single();

  if (error || !newRequest) {
    console.error("createRequest insert failed:", error);
    redirect(
      `/anfrage/neu?error=${encodeURIComponent("Anfrage konnte nicht gespeichert werden.")}`,
    );
  }

  redirect("/anfrage/erstellt");
}
