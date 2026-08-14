const relativeTimeFormatter = new Intl.RelativeTimeFormat("de", {
  numeric: "auto",
});

export function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diffMinutes = Math.round((date.getTime() - Date.now()) / 60000);

  if (Math.abs(diffMinutes) < 60) {
    return relativeTimeFormatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return relativeTimeFormatter.format(diffDays, "day");
}

export function formatNeededAt(dateString: string | null) {
  if (!dateString) return "Flexibel";

  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const time = date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (date.toDateString() === now.toDateString()) return `Heute · ${time}`;
  if (date.toDateString() === tomorrow.toDateString())
    return `Morgen · ${time}`;

  const day = date.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  return `${day} · ${time}`;
}

export function formatBudget(
  amount: number | null,
  currency: string,
): string | null {
  if (amount === null) return null;
  const value = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
  return `${value} ${currency}`;
}
