import { useEffect, useState } from "react";
import { api } from "../api/client";

function formatUptime(seconds) {
  if (!seconds) return "—";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

export default function BotStatusBadge() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = () => {
      api
        .get("/api/bot/status")
        .then((res) => setStatus(res.data))
        .catch(() => setStatus(null));
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000); // refresh toutes les 30s
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <div className="flex items-center gap-4 bg-ghost-panel border border-white/5 rounded-xl px-4 py-2 text-sm">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            status.online ? "bg-green-400" : "bg-red-400"
          }`}
        />
        <span className="text-white/70">{status.online ? "En ligne" : "Hors ligne"}</span>
      </div>
      <span className="text-white/30">|</span>
      <span className="text-white/50">{status.guildCount} serveurs</span>
      <span className="text-white/30">|</span>
      <span className="text-white/50">Uptime : {formatUptime(status.uptimeSeconds)}</span>
    </div>
  );
}
