import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function CommandsToggle({ guildId }) {
  const [commands, setCommands] = useState([]);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    api.get(`/api/guilds/${guildId}/commands`).then((res) => setCommands(res.data.commands));
  }, [guildId]);

  const toggle = (key) => {
    setCommands((prev) => prev.map((c) => (c.key === key ? { ...c, enabled: !c.enabled } : c)));
  };

  const save = async () => {
    setStatus("saving");
    const payload = Object.fromEntries(commands.map((c) => [c.key, c.enabled]));
    try {
      await api.put(`/api/guilds/${guildId}/commands`, { commands: payload });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="bg-ghost-panel border border-white/5 rounded-2xl p-6">
      <h2 className="font-semibold mb-4">Commandes activées</h2>

      <div className="space-y-2 mb-5">
        {commands.map((c) => (
          <label
            key={c.key}
            className="flex items-center justify-between bg-black/30 border border-white/10 rounded-lg px-3 py-2 cursor-pointer"
          >
            <span className="text-sm">{c.label}</span>
            <input
              type="checkbox"
              checked={c.enabled}
              onChange={() => toggle(c.key)}
              className="w-4 h-4 accent-ghost-accent"
            />
          </label>
        ))}
      </div>

      <button
        onClick={save}
        disabled={status === "saving"}
        className="w-full bg-ghost-accent hover:opacity-90 transition rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
      >
        {status === "saving" ? "Sauvegarde..." : status === "saved" ? "Sauvegardé ✅" : "Sauvegarder"}
      </button>
    </div>
  );
}
