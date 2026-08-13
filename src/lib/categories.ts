export type Category = {
  slug: string;
  label: string;
  emoji: string;
};

export const categories: Category[] = [
  { slug: "zuhause", label: "Zuhause", emoji: "🏠" },
  { slug: "reparatur", label: "Reparatur", emoji: "🔧" },
  { slug: "transport", label: "Transport", emoji: "🚚" },
  { slug: "hilfe", label: "Hilfe", emoji: "👥" },
  { slug: "events", label: "Events", emoji: "🎉" },
  { slug: "tiere", label: "Tiere", emoji: "🐕" },
  { slug: "technik", label: "Technik", emoji: "💻" },
  { slug: "lernen", label: "Lernen", emoji: "📚" },
  { slug: "freizeit", label: "Freizeit", emoji: "⚽" },
  { slug: "sonstiges", label: "Sonstiges", emoji: "✨" },
];
