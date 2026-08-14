import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

const inputClass =
  "h-11 rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profil/bearbeiten");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, city, bio, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Profil bearbeiten
      </h1>

      <form action={updateProfile} className="mt-8 flex flex-col gap-5">
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {profile?.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="h-20 w-20 rounded-full object-cover"
          />
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">
            Profilbild
          </span>
          <input
            name="avatar"
            type="file"
            accept="image/*"
            className="text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-brand/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand/20"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            name="fullName"
            type="text"
            defaultValue={profile?.full_name ?? ""}
            maxLength={80}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Stadt</span>
          <input
            name="city"
            type="text"
            defaultValue={profile?.city ?? ""}
            placeholder="z. B. St. Gallen"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">
            Über mich
          </span>
          <textarea
            name="bio"
            rows={3}
            defaultValue={profile?.bio ?? ""}
            placeholder="z. B. Ich helfe gerne bei Transport und Möbelaufbau."
            className="rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>

        <button
          type="submit"
          className="mt-2 h-12 rounded-full bg-brand text-base font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Speichern
        </button>
      </form>
    </div>
  );
}
