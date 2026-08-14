import Link from "next/link";

export default function RequestCreatedPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-3xl">
        ✅
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">
        Anfrage veröffentlicht!
      </h1>
      <p className="mt-2 text-slate-600">
        Andere Nutzer in deiner Nähe können deine Anfrage jetzt sehen und dir
        anbieten zu helfen.
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
