import axios from "axios";

/**
 * Pousse une config vers BotGhost via son système de Webhook Custom Event.
 * Côté BotGhost, il faut créer un Custom Event avec un trigger "Webhook",
 * puis dans l'event, utiliser "Set Variable" pour chaque variable reçue
 * (server-specific), targetée sur le guildId reçu.
 *
 * Doc: https://docs.botghost.com/custom-commands-and-events/events/webhooks
 */
export async function pushConfigToBotGhost(guildId, config) {
  const { BOTGHOST_BOT_ID, BOTGHOST_WEBHOOK_EVENT_ID, BOTGHOST_API_TOKEN } = process.env;

  if (!BOTGHOST_BOT_ID || !BOTGHOST_WEBHOOK_EVENT_ID || !BOTGHOST_API_TOKEN) {
    console.warn("[botghost] Webhook non configuré (.env incomplet) — push ignoré.");
    return { skipped: true };
  }

  const url = `https://api.botghost.com/webhook/${BOTGHOST_BOT_ID}/${BOTGHOST_WEBHOOK_EVENT_ID}`;

  // Format attendu par BotGhost : tableau d'objets { name, variable, value }
  const variables = [
    { name: "Guild ID", variable: "{guildId}", value: guildId },
    { name: "Welcome Message", variable: "{welcomeMessage}", value: config.welcomeMessage ?? "" },
    { name: "Welcome Channel ID", variable: "{welcomeChannelId}", value: config.welcomeChannelId ?? "" },
    { name: "Auto Role ID", variable: "{autoRoleId}", value: config.autoRoleId ?? "" },
    { name: "Prefix", variable: "{prefix}", value: config.prefix ?? "" },
  ];

  const { data } = await axios.post(
    url,
    { variables },
    { headers: { Authorization: BOTGHOST_API_TOKEN, "Content-Type": "application/json" } }
  );
  return data;
}

/**
 * Pousse la liste des rôles à réaction d'un serveur vers BotGhost.
 * Envoyé en JSON stringifié dans une variable texte — côté BotGhost, il faut
 * un Custom Command/Event qui parse ce JSON (via les actions JSON de BotGhost)
 * pour afficher/gérer les réactions réellement.
 */
export async function pushReactionRolesToBotGhost(guildId, reactionRoles) {
  const { BOTGHOST_BOT_ID, BOTGHOST_WEBHOOK_EVENT_ID, BOTGHOST_API_TOKEN } = process.env;
  if (!BOTGHOST_BOT_ID || !BOTGHOST_WEBHOOK_EVENT_ID || !BOTGHOST_API_TOKEN) {
    console.warn("[botghost] Webhook non configuré — push reaction roles ignoré.");
    return { skipped: true };
  }
  const url = `https://api.botghost.com/webhook/${BOTGHOST_BOT_ID}/${BOTGHOST_WEBHOOK_EVENT_ID}`;
  const variables = [
    { name: "Guild ID", variable: "{guildId}", value: guildId },
    { name: "Reaction Roles JSON", variable: "{reactionRolesJson}", value: JSON.stringify(reactionRoles) },
  ];
  const { data } = await axios.post(
    url,
    { variables },
    { headers: { Authorization: BOTGHOST_API_TOKEN, "Content-Type": "application/json" } }
  );
  return data;
}

/**
 * Pousse l'état activé/désactivé des commandes d'un serveur vers BotGhost.
 */
export async function pushCommandsToBotGhost(guildId, commands) {
  const { BOTGHOST_BOT_ID, BOTGHOST_WEBHOOK_EVENT_ID, BOTGHOST_API_TOKEN } = process.env;
  if (!BOTGHOST_BOT_ID || !BOTGHOST_WEBHOOK_EVENT_ID || !BOTGHOST_API_TOKEN) {
    console.warn("[botghost] Webhook non configuré — push commands ignoré.");
    return { skipped: true };
  }
  const url = `https://api.botghost.com/webhook/${BOTGHOST_BOT_ID}/${BOTGHOST_WEBHOOK_EVENT_ID}`;
  const variables = [
    { name: "Guild ID", variable: "{guildId}", value: guildId },
    { name: "Commands JSON", variable: "{commandsJson}", value: JSON.stringify(commands) },
  ];
  const { data } = await axios.post(
    url,
    { variables },
    { headers: { Authorization: BOTGHOST_API_TOKEN, "Content-Type": "application/json" } }
  );
  return data;
}
