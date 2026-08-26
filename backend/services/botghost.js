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
