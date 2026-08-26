import { Router } from "express";
import { requireAuth, requireGuildManage } from "../middleware/auth.js";
import { db } from "../db.js";
import { pushConfigToBotGhost } from "../services/botghost.js";
import { addLog } from "../logs.js";

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
  await addLog(guildId, req.authSession.user, "Configuration mise à jour", "message de bienvenue / salon / rôle / préfixe");

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

router.get("/:guildId/logs", requireAuth, requireGuildManage, async (req, res) => {
  await db.read();
  const logs = (db.data.logs || [])
    .filter((l) => l.guildId === req.params.guildId)
    .slice(0, 50);
  res.json({ logs });
});

export default router;
