export default function BannedPage() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Konto gesperrt</h1>
      <p className="mt-2 text-slate-600">
        Dein Konto wurde von unserem Team gesperrt, weil es gegen unsere{" "}
        <a href="/sicherheit" className="text-brand hover:underline">
          Regeln
        </a>{" "}
        verstoßen hat. Falls du glaubst, dass das ein Fehler ist, kontaktiere
        uns bitte.
      </p>
    </div>
  );
}
