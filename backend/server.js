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
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

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
