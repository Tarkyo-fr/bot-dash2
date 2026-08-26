import { Router } from "express";
import { requireAuth, requireGuildManage } from "../middleware/auth.js";
import { db } from "../db.js";
import { pushCommandsToBotGhost } from "../services/botghost.js";
import { addLog } from "../logs.js";

const router = Router();

// Liste des modules/commandes que le dashboard peut activer/désactiver.
// Adapte cette liste pour qu'elle corresponde aux vrais modules de ton bot.
export const AVAILABLE_COMMANDS = [
  { key: "welcome", label: "Message de bienvenue" },
  { key: "autorole", label: "Rôle automatique" },
  { key: "reactionRoles", label: "Rôles à réaction" },
  { key: "moderation", label: "Modération" },
  { key: "leveling", label: "Système de niveaux" },
];

router.get("/:guildId/commands", requireAuth, requireGuildManage, async (req, res) => {
  await db.read();
  const stored = db.data.guildCommands[req.params.guildId] || {};
  const commands = AVAILABLE_COMMANDS.map((c) => ({
    ...c,
    enabled: stored[c.key] ?? true,
  }));
  res.json({ commands });
});

router.put("/:guildId/commands", requireAuth, requireGuildManage, async (req, res) => {
  const { guildId } = req.params;
  const { commands } = req.body; // { [key]: boolean }

  await db.read();
  db.data.guildCommands[guildId] = commands;
  await db.write();
  await addLog(guildId, req.authSession.user, "Commandes mises à jour", JSON.stringify(commands));

  let botghostSync = "skipped";
  try {
    const result = await pushCommandsToBotGhost(guildId, commands);
    botghostSync = result.skipped ? "skipped" : "ok";
  } catch (err) {
    console.error("[commands] échec sync BotGhost:", err.response?.data || err.message);
    botghostSync = "error";
  }

  res.json({ commands, botghostSync });
});

export default router;
