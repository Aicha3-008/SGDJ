export function formatDate(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
      + " " + date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateShort(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
