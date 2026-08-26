import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import guildsRoutes from "./routes/guilds.js";
import configRoutes from "./routes/config.js";

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

// Railway/Render sont derrière un proxy HTTPS.
if (isProd) app.set("trust proxy", 1);

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Les routes /auth et /api ne doivent jamais être mises en cache par le
// navigateur, sinon un utilisateur peut voir les données d'une requête
// précédente (ou un statut de connexion périmé).
app.use(["/auth", "/api"], (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

app.use("/auth", authRoutes);
app.use("/api/guilds", guildsRoutes);
app.use("/api/guilds", configRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend prêt sur le port ${PORT}`);
});
