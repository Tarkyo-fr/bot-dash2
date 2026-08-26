import { db } from "./db.js";
import { nanoid } from "nanoid";

const MAX_LOGS = 500;

export async function addLog(guildId, user, action, summary = "") {
  await db.read();
  db.data.logs ||= [];
  db.data.logs.unshift({
    id: nanoid(8),
    guildId,
    userId: user.id,
    username: user.username,
    action,
    summary,
    timestamp: new Date().toISOString(),
  });
  db.data.logs = db.data.logs.slice(0, MAX_LOGS);
  await db.write();
}
