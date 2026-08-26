import { Router } from "express";
import axios from "axios";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db.js";

const router = Router();

const MANAGE_GUILD = 0x20;

// Liste les serveurs où l'utilisateur a la permission de gérer le bot,
// avec détection de la présence du bot (nécessite DISCORD_BOT_TOKEN) et
// un lien d'invitation prêt à l'emploi pour les serveurs où il n'est pas
// encore présent.
router.get("/", requireAuth, async (req, res) => {
  await db.read();

  const manageable = (req.authSession.guilds || []).filter(
    (g) => g.owner || (BigInt(g.permissions || 0) & BigInt(MANAGE_GUILD)) === BigInt(MANAGE_GUILD)
  );

  const botToken = process.env.DISCORD_BOT_TOKEN;

  const guilds = await Promise.all(
    manageable.map(async (g) => {
      let botPresent = null; // null = impossible à vérifier (pas de token bot configuré)
      if (botToken) {
        try {
          await axios.get(`https://discord.com/api/guilds/${g.id}`, {
            headers: { Authorization: `Bot ${botToken}` },
          });
          botPresent = true;
        } catch {
          botPresent = false;
        }
      }
      return {
        id: g.id,
        name: g.name,
        icon: g.icon,
        owner: g.owner,
        hasConfig: Boolean(db.data.guildConfigs[g.id]),
        botPresent,
      };
    })
  );

  res.json({ guilds, botClientId: process.env.BOT_CLIENT_ID || null });
});

export default router;
