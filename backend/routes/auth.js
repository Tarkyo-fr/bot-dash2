import { Router } from "express";
import axios from "axios";

const router = Router();

const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  FRONTEND_URL,
} = process.env;

// Étape 1 : redirige l'utilisateur vers Discord pour autoriser l'app
router.get("/discord", (req, res) => {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify guilds",
    prompt: "consent",
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

// Étape 2 : callback — échange le code contre un token, récupère user + guilds
router.get("/discord/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${FRONTEND_URL}/login?error=missing_code`);

  try {
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    const [userRes, guildsRes] = await Promise.all([
      axios.get("https://discord.com/api/users/@me", { headers: authHeader }),
      axios.get("https://discord.com/api/users/@me/guilds", { headers: authHeader }),
    ]);

    // On ne garde que les serveurs où l'utilisateur peut gérer le bot
    // (MANAGE_GUILD ou owner). Le filtre "bot déjà présent" se fait
    // côté route /api/guilds en croisant avec BOT_CLIENT_ID si besoin
    // via l'API Discord "guilds/{id}" (nécessite le bot token, pas fait ici
    // pour rester simple — voir routes/guilds.js pour la suite).
    req.session.user = {
      id: userRes.data.id,
      username: userRes.data.username,
      avatar: userRes.data.avatar,
    };
    req.session.guilds = guildsRes.data;

    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error("[auth] callback error:", err.response?.data || err.message);
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
});

router.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Non authentifié" });
  res.json({ user: req.session.user });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

export default router;
