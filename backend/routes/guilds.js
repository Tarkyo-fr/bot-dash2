import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db.js";

const router = Router();

const MANAGE_GUILD = 0x20;

// Liste les serveurs où l'utilisateur a la permission de gérer le bot
router.get("/", requireAuth, async (req, res) => {
  await db.read();
  const guilds = (req.session.guilds || [])
    .filter((g) => g.owner || (BigInt(g.permissions || 0) & BigInt(MANAGE_GUILD)) === BigInt(MANAGE_GUILD))
    .map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      owner: g.owner,
      hasConfig: Boolean(db.data.guildConfigs[g.id]),
    }));
  res.json({ guilds });
});

export default router;
