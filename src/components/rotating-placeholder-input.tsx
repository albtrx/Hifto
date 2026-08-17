"use client";

import { useEffect, useState } from "react";

const examples = [
  "Ich brauche heute einen Elektriker.",
  "Ich brauche Hilfe beim Umzug.",
  "Ich suche jemanden für meinen Garten.",
  "Ich brauche morgen einen Fotografen.",
];

export function RotatingPlaceholderInput() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % examples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <input
      type="text"
      name="titel"
      placeholder={examples[index]}
      className="h-14 flex-1 rounded-full border border-slate-300 bg-white px-6 text-base text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
    />
  );
}
