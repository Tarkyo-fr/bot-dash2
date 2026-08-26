# Bot Dashboard (BotGhost)

Dashboard permettant à tes utilisateurs de gérer la config du bot sur leur
serveur Discord (message de bienvenue, rôle auto, préfixe...), avec login
OAuth2 Discord, et synchronisation vers un bot BotGhost.

## Pourquoi cette architecture

BotGhost n'a pas d'API publique pour **lire** ses variables depuis
l'extérieur. Le seul point d'entrée externe fiable, ce sont ses **Webhooks**
qui déclenchent un Custom Event. Donc :

- Ton **backend** est la source de vérité (stocke la config en base).
- Quand un admin sauvegarde depuis le dashboard, le backend **pousse** la
  config vers BotGhost via un webhook.
- Côté BotGhost, un Custom Event reçoit ce webhook et fait un "Set Variable"
  pour chaque valeur (server-specific, ciblé sur le guildId reçu).
- Le bot utilise ensuite ces `{BGVAR_...}` normalement dans ses
  commandes/events (message de bienvenue, auto-role, etc.).

## 1. Setup Discord Developer Portal

1. https://discord.com/developers/applications → ton application (ou celle du bot BotGhost)
2. OAuth2 > General : ajoute une Redirect URL : `http://localhost:3001/auth/discord/callback`
3. Récupère `Client ID` et `Client Secret`

## 2. Setup côté BotGhost (Custom Event + Webhook)

1. Dans ton bot BotGhost → **Custom Commands and Events > Events > New Event**
2. Trigger : **Webhook**
3. Note l'**Event ID** généré et ton **Bot ID** (visible dans l'URL du dashboard BotGhost)
4. Récupère ton **API Token** BotGhost (Bot Settings > API, ou équivalent)
5. Dans l'event, ajoute des actions **Set Variable** (une par valeur reçue : `welcomeMessage`, `welcomeChannelId`, `autoRoleId`, `prefix`), en "Server specific", ciblées sur la variable webhook `{guildId}` reçue dans la requête.

## 3. Backend

```bash
cd backend
cp .env.example .env
# remplis DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, BOTGHOST_BOT_ID,
# BOTGHOST_WEBHOOK_EVENT_ID, BOTGHOST_API_TOKEN
npm install
npm run dev
```

Tourne sur http://localhost:3001

## 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Tourne sur http://localhost:5173

## 5. Déploiement (Netlify + Railway)

**Backend sur Railway :**
1. Push le repo sur GitHub
2. https://railway.app → connecte-toi avec GitHub → **New Project** → **Deploy from GitHub repo** → sélectionne `botghost-dashboard`
3. Railway crée un service pointant sur la racine du repo. Va dans **Settings** du service :
   - **Root Directory** : `backend`
   - **Start Command** : `npm start` (déjà défini par `railway.toml`, mais vérifie)
4. Onglet **Variables** : ajoute toutes les variables du `.env.example` du backend (`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`, `BOT_CLIENT_ID`, `BOTGHOST_BOT_ID`, `BOTGHOST_WEBHOOK_EVENT_ID`, `BOTGHOST_API_TOKEN`, `SESSION_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`). Mets des placeholders pour `DISCORD_REDIRECT_URI` et `FRONTEND_URL`, on les corrige à l'étape 7.
5. Onglet **Settings > Networking** : clique **Generate Domain** pour obtenir une URL publique (ex: `https://botghost-dashboard-backend-production.up.railway.app`)
6. Railway build et déploie automatiquement. Vérifie sur `https://TON-URL-RAILWAY.up.railway.app/health` → `{"ok":true}`

**Frontend sur Netlify :**
1. https://app.netlify.com → **Add new site > Import an existing project** → GitHub → `botghost-dashboard`
2. Le `netlify.toml` configure déjà base `frontend` / build `npm run build` / publish `frontend/dist`
3. **Site settings > Environment variables** : `VITE_API_URL` = l'URL Railway de l'étape 5
4. **Deploy site** → tu obtiens `https://ton-site.netlify.app`

**7. Reboucler les URLs (obligatoire) :**
- Sur Railway (Variables) : `DISCORD_REDIRECT_URI` = `https://TON-URL-RAILWAY.up.railway.app/auth/discord/callback`, `FRONTEND_URL` = `https://ton-site.netlify.app` → Railway redéploie automatiquement au save
- Sur Discord Developer Portal > OAuth2 > Redirects : ajoute exactement la même `DISCORD_REDIRECT_URI`

> Note : Railway offre un crédit gratuit mensuel (pas de mise en veille comme
> Render en free tier), au-delà c'est payant à l'usage — largement suffisant
> pour un dashboard communautaire au démarrage.

> ⚠️ **Important** : comme sur la plupart des plateformes serverless/PaaS, le
> système de fichiers de Railway n'est pas garanti persistant entre les
> redéploiements (un `git push` peut repartir d'un disque vierge). `lowdb`
> écrit dans `backend/data/db.json`, donc **tes configs peuvent être perdues
> au prochain déploiement**. Deux options : ajouter un [Railway Volume](https://docs.railway.app/reference/volumes)
> monté sur `backend/data`, ou (recommandé pour la prod) migrer vers Railway
> Postgres/MongoDB Atlas — voir la section suivante.

## 6. Nouvelles fonctionnalités : setup complémentaire

### Statut du bot en direct (en ligne/hors ligne, nb serveurs, uptime)

BotGhost n'expose pas ce statut directement. Le principe : le bot lui-même
envoie un signal de vie ("heartbeat") à ton backend toutes les quelques minutes.

1. Dans BotGhost, crée un **Custom Event** avec un trigger **Timed Message**
   (ou équivalent planifié), fréquence toutes les 2-3 minutes
2. Ajoute une action **Send an API Request** :
   - Méthode : `POST`
   - URL : `https://ton-backend.up.railway.app/api/bot/heartbeat`
   - Body (JSON) :
     ```json
     { "secret": "LA_MEME_VALEUR_QUE_BOTGHOST_HEARTBEAT_SECRET", "guildCount": {Bot.guilds.length} }
     ```
     (adapte `{Bot.guilds.length}` à la vraie variable BotGhost donnant le nombre de serveurs — vérifie dans le sélecteur de variables)
3. Le dashboard affiche "hors ligne" si aucun heartbeat reçu depuis 5 minutes

### Bouton "Ajouter le bot"

Nécessite `DISCORD_BOT_TOKEN` (le vrai token du bot, pas le Client Secret
OAuth2) dans les variables Railway, pour que le backend puisse vérifier sur
quels serveurs le bot est déjà présent. Sans cette variable, le bouton
"Ajouter le bot" ne s'affiche jamais (fallback silencieux).

### Rôles à réaction / Commandes activées

Ces données sont poussées vers BotGhost en JSON stringifié dans une variable
texte (`{reactionRolesJson}`, `{commandsJson}`). Côté BotGhost, il faudra un
Custom Command/Event qui **parse ce JSON** (via les actions de traitement JSON
de BotGhost) pour s'en servir réellement dans le comportement du bot — le
dashboard s'occupe du stockage et de l'envoi, pas de l'interprétation
BotGhost-side.

## Prochaines étapes suggérées

- Remplacer lowdb (fichier JSON) par MongoDB/PostgreSQL une fois que ça tourne
- Filtrer la liste des serveurs pour n'afficher que ceux où **le bot est
  déjà présent** (nécessite un appel à l'API Discord avec le token du bot :
  `GET /guilds/{id}` avec le bot token, ou `GET /users/@me/guilds` du bot)
- Déployer : backend sur un VPS/Render/Railway, frontend sur Vercel/Netlify
  (penser à passer les cookies de session en `secure: true` + `sameSite: "none"`
  si domaines différents en prod)
- Ajouter un log des dernières actions du bot (autre webhook BotGhost → backend
  cette fois, via une action "Send an API Request" côté BotGhost)
