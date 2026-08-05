const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Origine du serveur (sans /api) : utile pour construire l'URL absolue des fichiers
// statiques servis hors du prefixe /api (ex: photos de profil sous /uploads/**).
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export function toAbsoluteFileUrl(path) {
  if (!path) return null;
  return `${API_ORIGIN}${path}`;
}
