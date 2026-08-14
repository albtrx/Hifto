import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { blockUser, unblockUser } from "./actions";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ blockiert?: string; gemeldet?: string }>;
}) {
  const { id } = await params;
  const { blockiert, gemeldet } = await searchParams;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, city, bio, avatar_url, created_at")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === id;

  let isBlocked = false;
  if (user && !isOwnProfile) {
    const { data: block } = await supabase
      .from("blocks")
      .select("id")
      .eq("blocker_id", user.id)
      .eq("blocked_id", id)
      .maybeSingle();
    isBlocked = Boolean(block);
  }

  const [{ data: reviews }, { count: successfulHelps }] = await Promise.all([
    supabase.from("reviews").select("rating").eq("reviewee_id", id),
    supabase
      .from("requests")
      .select("id", { count: "exact", head: true })
      .eq("helper_id", id)
      .eq("status", "closed"),
  ]);

  const reviewCount = reviews?.length ?? 0;
  const avgRating =
    reviewCount > 0
      ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;

  const memberSince = new Date(profile.created_at).toLocaleDateString(
    "de-DE",
    { month: "long", year: "numeric" },
  );

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-4">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-2xl font-semibold text-brand">
            {(profile.full_name ?? "?").charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {profile.full_name ?? "Unbenannter Nutzer"}
          </h1>
          {profile.city && (
            <p className="text-sm text-slate-500">📍 {profile.city}</p>
          )}
          <p className="text-xs text-slate-400">Mitglied seit {memberSince}</p>
        </div>
      </div>

      {profile.bio && (
        <p className="mt-6 whitespace-pre-wrap text-slate-700">
          {profile.bio}
        </p>
      )}

      <div className="mt-6 flex gap-6 rounded-2xl border border-slate-200 bg-white p-4">
        <div>
          <p className="text-lg font-bold text-slate-900">
            {avgRating ? `⭐ ${avgRating.toFixed(1)}` : "Noch keine"}
          </p>
          <p className="text-xs text-slate-500">
            {reviewCount} {reviewCount === 1 ? "Bewertung" : "Bewertungen"}
          </p>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900">
            {successfulHelps ?? 0}
          </p>
          <p className="text-xs text-slate-500">Erfolgreiche Hilfen</p>
        </div>
      </div>

      {gemeldet === "1" && (
        <p className="mt-6 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
          Danke, deine Meldung wurde übermittelt.
        </p>
      )}
      {blockiert === "1" && (
        <p className="mt-6 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
          Nutzer blockiert.
        </p>
      )}

      {isOwnProfile ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/profil/bearbeiten"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-700 transition-colors hover:border-brand hover:text-brand"
          >
            Profil bearbeiten
          </Link>
          <Link
            href="/profil/blockiert"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-700 transition-colors hover:border-brand hover:text-brand"
          >
            Blockierte Nutzer
          </Link>
        </div>
      ) : (
        user && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/melden?userId=${id}`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-700 transition-colors hover:border-red-400 hover:text-red-600"
            >
              Melden
            </Link>
            <form action={isBlocked ? unblockUser : blockUser}>
              <input type="hidden" name="userId" value={id} />
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-700 transition-colors hover:border-red-400 hover:text-red-600"
              >
                {isBlocked ? "Entblocken" : "Blockieren"}
              </button>
            </form>
          </div>
        )
      )}
    </div>
  );
}
