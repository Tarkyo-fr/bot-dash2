import { Router } from "express";
import { nanoid } from "nanoid";
import { requireAuth, requireGuildManage } from "../middleware/auth.js";
import { db } from "../db.js";
import { pushReactionRolesToBotGhost } from "../services/botghost.js";
import { addLog } from "../logs.js";

const router = Router();

router.get("/:guildId/reaction-roles", requireAuth, requireGuildManage, async (req, res) => {
  await db.read();
  res.json({ reactionRoles: db.data.guildReactionRoles[req.params.guildId] || [] });
});

router.post("/:guildId/reaction-roles", requireAuth, requireGuildManage, async (req, res) => {
  const { guildId } = req.params;
  const { emoji, roleId, messageId } = req.body;

  if (!emoji || !roleId) {
    return res.status(400).json({ error: "emoji et roleId sont requis" });
  }

  await db.read();
  db.data.guildReactionRoles[guildId] ||= [];
  const entry = { id: nanoid(8), emoji, roleId, messageId: messageId || "" };
  db.data.guildReactionRoles[guildId].push(entry);
  await db.write();
  await addLog(guildId, req.authSession.user, "Rôle réaction ajouté", `${emoji} → rôle ${roleId}`);

  let botghostSync = "skipped";
  try {
    const result = await pushReactionRolesToBotGhost(guildId, db.data.guildReactionRoles[guildId]);
    botghostSync = result.skipped ? "skipped" : "ok";
  } catch (err) {
    console.error("[reaction-roles] échec sync BotGhost:", err.response?.data || err.message);
    botghostSync = "error";
  }

  res.json({ reactionRoles: db.data.guildReactionRoles[guildId], botghostSync });
});

router.delete("/:guildId/reaction-roles/:entryId", requireAuth, requireGuildManage, async (req, res) => {
  const { guildId, entryId } = req.params;

  await db.read();
  db.data.guildReactionRoles[guildId] = (db.data.guildReactionRoles[guildId] || []).filter(
    (e) => e.id !== entryId
  );
  await db.write();
  await addLog(guildId, req.authSession.user, "Rôle réaction supprimé", entryId);

  let botghostSync = "skipped";
  try {
    const result = await pushReactionRolesToBotGhost(guildId, db.data.guildReactionRoles[guildId]);
    botghostSync = result.skipped ? "skipped" : "ok";
  } catch (err) {
    console.error("[reaction-roles] échec sync BotGhost:", err.response?.data || err.message);
    botghostSync = "error";
  }

  res.json({ reactionRoles: db.data.guildReactionRoles[guildId], botghostSync });
});

export default router;
