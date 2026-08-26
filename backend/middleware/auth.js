import { getSession } from "../sessionStore.js";

function extractSession(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  return getSession(token);
}

export function requireAuth(req, res, next) {
  const session = extractSession(req);
  if (!session) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  req.authSession = session;
  next();
}

// Vérifie que l'utilisateur connecté a la permission MANAGE_GUILD (0x20)
// sur le guildId demandé, en se basant sur la liste de guilds mise en cache
// dans la session lors du login (voir routes/auth.js).
export function requireGuildManage(req, res, next) {
  const { guildId } = req.params;
  const guild = (req.authSession.guilds || []).find((g) => g.id === guildId);
  if (!guild) {
    return res.status(403).json({ error: "Accès refusé à ce serveur" });
  }
  const MANAGE_GUILD = 0x20;
  const perms = BigInt(guild.permissions || 0);
  const isOwner = guild.owner;
  const canManage = isOwner || (perms & BigInt(MANAGE_GUILD)) === BigInt(MANAGE_GUILD);
  if (!canManage) {
    return res.status(403).json({ error: "Permission MANAGE_GUILD requise" });
  }
  req.guild = guild;
  next();
}
