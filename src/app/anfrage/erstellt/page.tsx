import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function RequestCreatedPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>;
}) {
  const { requestId } = await searchParams;

  let matchingProviders: number | null = null;

  if (requestId) {
    const supabase = await createClient();
    const { data: request } = await supabase
      .from("requests")
      .select("category")
      .eq("id", requestId)
      .single();

    if (request) {
      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_provider", true)
        .contains("provider_categories", [request.category]);
      matchingProviders = count ?? 0;
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-3xl">
        ✅
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">
        Deine Anfrage ist veröffentlicht.
      </h1>

      {matchingProviders !== null && matchingProviders > 0 && (
        <p className="mt-4 rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand">
          {matchingProviders}{" "}
          {matchingProviders === 1
            ? "passender Anbieter gefunden"
            : "passende Anbieter gefunden"}
        </p>
      )}

      <p className="mt-4 text-slate-600">
        Wir informieren passende Anbieter in deiner Nähe. Du bekommst eine
        Benachrichtigung, sobald jemand ein Angebot abgibt.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
