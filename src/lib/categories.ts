export type Category = {
  slug: string;
  label: string;
  emoji: string;
  color: string;
};

export const categories: Category[] = [
  { slug: "reparatur", label: "Reparatur", emoji: "🔧", color: "bg-blue-100" },
  { slug: "zuhause", label: "Zuhause", emoji: "🏠", color: "bg-orange-100" },
  { slug: "transport", label: "Transport", emoji: "🚚", color: "bg-amber-100" },
  { slug: "reinigung", label: "Reinigung", emoji: "🧹", color: "bg-cyan-100" },
  { slug: "garten", label: "Garten", emoji: "🌳", color: "bg-green-100" },
  { slug: "technik", label: "Technik", emoji: "💻", color: "bg-sky-100" },
  { slug: "lernen", label: "Lernen", emoji: "📚", color: "bg-fuchsia-100" },
  { slug: "tiere", label: "Tiere", emoji: "🐕", color: "bg-lime-100" },
  { slug: "events", label: "Events", emoji: "📸", color: "bg-pink-100" },
  {
    slug: "sonstige-hilfe",
    label: "Sonstige Hilfe",
    emoji: "👥",
    color: "bg-violet-100",
  },
];
