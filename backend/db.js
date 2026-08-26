import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "data", "db.json");

const defaultData = {
  guildConfigs: {},
  guildReactionRoles: {},
  guildCommands: {},
  logs: [],
  botStatus: { lastSeen: null, guildCount: 0, startedAt: null },
};
// guildConfigs: { [guildId]: { welcomeMessage, welcomeChannelId, autoRoleId, prefix, updatedAt, updatedBy } }
// guildReactionRoles: { [guildId]: [{ id, emoji, roleId, messageId }] }
// guildCommands: { [guildId]: { [commandKey]: boolean } }
// logs: [{ id, guildId, userId, username, action, summary, timestamp }]
// botStatus: { lastSeen, guildCount, startedAt } — alimenté par /api/bot/heartbeat

export const db = new Low(new JSONFile(file), defaultData);
await db.read();
// Fusionne les clés par défaut manquantes (utile quand db.json existe déjà
// depuis une version antérieure du schéma, ex: avant l'ajout de botStatus/logs).
db.data = { ...defaultData, ...db.data };
await db.write();
