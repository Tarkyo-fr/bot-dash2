import { nanoid } from "nanoid";

// Store de sessions en mémoire, identifié par un token opaque (pas un cookie).
// Le frontend récupère ce token après le login OAuth2 et le renvoie dans le
// header "Authorization: Bearer <token>" à chaque requête — ça évite tous les
// problèmes de cookies cross-site (Safari/Chrome bloquent de plus en plus les
// cookies tiers quand frontend et backend sont sur des domaines différents).
const sessions = new Map();

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 jours

export function createSession(data) {
  const token = nanoid(32);
  sessions.set(token, { ...data, createdAt: Date.now() });
  return token;
}

export function getSession(token) {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function deleteSession(token) {
  sessions.delete(token);
}
