import { Router } from "express";
import { db } from "../db.js";

const router = Router();

const ONLINE_THRESHOLD_MS = 1000 * 60 * 5; // pas de heartbeat depuis 5 min = considéré offline

// Appelé PAR le bot BotGhost lui-même (pas par le dashboard), via une action
// "Send an API Request" dans un event planifié/timed message qui se déclenche
// toutes les X minutes. Protégé par un secret partagé (pas par un token
// utilisateur, puisque c'est le bot qui appelle, pas une personne connectée).
router.post("/heartbeat", async (req, res) => {
  const { secret, guildCount } = req.body;
  if (!process.env.BOTGHOST_HEARTBEAT_SECRET || secret !== process.env.BOTGHOST_HEARTBEAT_SECRET) {
    return res.status(401).json({ error: "Secret invalide" });
  }

  await db.read();
  db.data.botStatus.lastSeen = new Date().toISOString();
  if (guildCount !== undefined) db.data.botStatus.guildCount = guildCount;
  if (!db.data.botStatus.startedAt) db.data.botStatus.startedAt = new Date().toISOString();
  await db.write();

  res.json({ ok: true });
});

// Lu par le dashboard — pas besoin d'authentification, c'est un statut global
// sans donnée sensible (pas de config serveur spécifique ici).
router.get("/status", async (req, res) => {
  await db.read();
  const { lastSeen, guildCount, startedAt } = db.data.botStatus;
  const online = lastSeen ? Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS : false;
  const uptimeSeconds = startedAt ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000) : 0;

  res.json({ online, guildCount: guildCount ?? 0, uptimeSeconds, lastSeen });
});

export default router;
