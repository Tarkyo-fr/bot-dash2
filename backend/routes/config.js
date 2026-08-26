import { Router } from "express";
import { requireAuth, requireGuildManage } from "../middleware/auth.js";
import { db } from "../db.js";
import { pushConfigToBotGhost } from "../services/botghost.js";

const router = Router();

router.get("/:guildId/config", requireAuth, requireGuildManage, async (req, res) => {
  await db.read();
  const config = db.data.guildConfigs[req.params.guildId] || {
    welcomeMessage: "",
    welcomeChannelId: "",
    autoRoleId: "",
    prefix: "!",
  };
  res.json({ config });
});

router.put("/:guildId/config", requireAuth, requireGuildManage, async (req, res) => {
  const { guildId } = req.params;
  const { welcomeMessage, welcomeChannelId, autoRoleId, prefix } = req.body;

  await db.read();
  const config = {
    welcomeMessage: welcomeMessage ?? "",
    welcomeChannelId: welcomeChannelId ?? "",
    autoRoleId: autoRoleId ?? "",
    prefix: prefix ?? "!",
    updatedAt: new Date().toISOString(),
    updatedBy: req.authSession.user.id,
  };
  db.data.guildConfigs[guildId] = config;
  await db.write();

  // Synchronise vers BotGhost (n'échoue pas la requête si BotGhost est down/pas configuré)
  let botghostSync = "skipped";
  try {
    const result = await pushConfigToBotGhost(guildId, config);
    botghostSync = result.skipped ? "skipped" : "ok";
  } catch (err) {
    console.error("[config] échec sync BotGhost:", err.response?.data || err.message);
    botghostSync = "error";
  }

  res.json({ config, botghostSync });
});

export default router;
