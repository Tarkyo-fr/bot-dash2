export function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  next();
}

// Vérifie que l'utilisateur connecté a la permission MANAGE_GUILD (0x20)
// sur le guildId demandé, en se basant sur la liste de guilds mise en cache
// en session lors du login (voir routes/auth.js).
export function requireGuildManage(req, res, next) {
  const { guildId } = req.params;
  const guild = (req.session.guilds || []).find((g) => g.id === guildId);
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
