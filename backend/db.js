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
db.data ||= defaultData;
await db.write();
