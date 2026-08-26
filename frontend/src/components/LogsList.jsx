import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function LogsList({ guildId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get(`/api/guilds/${guildId}/logs`).then((res) => setLogs(res.data.logs));
  }, [guildId]);

  return (
    <div className="bg-ghost-panel border border-white/5 rounded-2xl p-6">
      <h2 className="font-semibold mb-4">Dernières actions</h2>

      {logs.length === 0 && <p className="text-white/40 text-sm">Aucune action enregistrée.</p>}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.map((l) => (
          <div key={l.id} className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm">
            <div className="flex justify-between items-start">
              <span className="font-medium">{l.action}</span>
              <span className="text-white/30 text-xs">
                {new Date(l.timestamp).toLocaleString("fr-FR")}
              </span>
            </div>
            <p className="text-white/40 text-xs mt-1">
              par {l.username} {l.summary && `— ${l.summary}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
