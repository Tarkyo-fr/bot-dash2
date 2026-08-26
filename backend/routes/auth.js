import { Router } from "express";
import axios from "axios";
import { createSession, deleteSession } from "../sessionStore.js";
import { requireAuth } from "../middleware/auth.js";

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

// Étape 2 : callback — échange le code contre un token, récupère user + guilds,
// crée une session côté serveur, et renvoie le token de session au frontend
// via un paramètre d'URL (le frontend le stocke ensuite dans localStorage).
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

    const sessionToken = createSession({
      user: {
        id: userRes.data.id,
        username: userRes.data.username,
        avatar: userRes.data.avatar,
      },
      guilds: guildsRes.data,
    });

    res.redirect(`${FRONTEND_URL}/auth/callback?token=${sessionToken}`);
  } catch (err) {
    console.error("[auth] callback error:", err.response?.data || err.message);
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.authSession.user });
});

router.post("/logout", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token) deleteSession(token);
  res.json({ ok: true });
});

export default router;
