export default function SafetyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Sicherheit &amp; Regeln
      </h1>
      <p className="mt-4 text-slate-600">
        Hifto bringt Menschen zusammen, die sich vorher meist nicht kennen.
        Damit das gut funktioniert, gelten ein paar einfache Regeln.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Kontakt nur über die Plattform
          </h2>
          <p className="mt-1 text-slate-600">
            Anfragen zeigen keine privaten Kontaktdaten wie Telefonnummer
            oder E-Mail-Adresse öffentlich an. Die erste Kontaktaufnahme
            läuft immer über "Ich kann helfen" und die eingebaute
            Nachrichtenfunktion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Melden &amp; Blockieren
          </h2>
          <p className="mt-1 text-slate-600">
            Jede Anfrage und jedes Profil kann gemeldet werden. Du kannst
            außerdem jederzeit andere Nutzer blockieren — blockierte Nutzer
            und ihre Anfragen werden dir dann nicht mehr angezeigt.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Moderation
          </h2>
          <p className="mt-1 text-slate-600">
            Gemeldete Inhalte werden von unserem Team geprüft. Anfragen, die
            gegen diese Regeln verstoßen, können entfernt werden, wiederholte
            Verstöße können zur Sperrung des Kontos führen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Vorsicht bei Treffen
          </h2>
          <p className="mt-1 text-slate-600">
            Triff dich nach Möglichkeit an belebten, öffentlichen Orten und
            gib niemals Zahlungen im Voraus, ohne die Person zu kennen. Hifto
            ist eine Vermittlungsplattform und keine Vertragspartei zwischen
            Nutzern.
          </p>
        </section>
      </div>
    </div>
  );
}
