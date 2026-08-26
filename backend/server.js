import "dotenv/config";
import express from "express";
import session from "express-session";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import guildsRoutes from "./routes/guilds.js";
import configRoutes from "./routes/config.js";

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

// Render est derrière un proxy HTTPS : nécessaire pour que "secure: true"
// sur le cookie fonctionne correctement (sinon Express le croit en HTTP).
if (isProd) app.set("trust proxy", 1);

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // Netlify (frontend) et Render (backend) sont sur des domaines différents,
      // donc il faut sameSite:"none" + secure:true en prod pour que le cookie
      // de session soit envoyé cross-domain.
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
    },
  })
);

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(
  session({
    // ... (ne touche pas à cette partie)
  })
);

// ⬇️ Ce bloc doit être ICI, avant les routes
app.use(["/auth", "/api"], (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

// ⬇️ Les routes viennent après
app.use("/auth", authRoutes);
app.use("/api/guilds", guildsRoutes);
app.use("/api/guilds", configRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Backend prêt sur http://localhost:${PORT}`);
});
