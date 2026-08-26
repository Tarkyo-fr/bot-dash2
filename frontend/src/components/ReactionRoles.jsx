import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function ReactionRoles({ guildId }) {
  const [roles, setRoles] = useState([]);
  const [emoji, setEmoji] = useState("");
  const [roleId, setRoleId] = useState("");
  const [messageId, setMessageId] = useState("");
  const [status, setStatus] = useState("idle");

  const load = () => {
    api.get(`/api/guilds/${guildId}/reaction-roles`).then((res) => setRoles(res.data.reactionRoles));
  };

  useEffect(load, [guildId]);

  const add = async (e) => {
    e.preventDefault();
    if (!emoji || !roleId) return;
    setStatus("saving");
    try {
      const res = await api.post(`/api/guilds/${guildId}/reaction-roles`, { emoji, roleId, messageId });
      setRoles(res.data.reactionRoles);
      setEmoji("");
      setRoleId("");
      setMessageId("");
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  const remove = async (entryId) => {
    const res = await api.delete(`/api/guilds/${guildId}/reaction-roles/${entryId}`);
    setRoles(res.data.reactionRoles);
  };

  return (
    <div className="bg-ghost-panel border border-white/5 rounded-2xl p-6">
      <h2 className="font-semibold mb-4">Rôles à réaction</h2>

      <div className="space-y-2 mb-5">
        {roles.length === 0 && (
          <p className="text-white/40 text-sm">Aucun rôle à réaction configuré.</p>
        )}
        {roles.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between bg-black/30 border border-white/10 rounded-lg px-3 py-2"
          >
            <div className="text-sm">
              <span className="text-lg mr-2">{r.emoji}</span>
              <span className="text-white/50">→ rôle</span>{" "}
              <span className="font-mono text-white/80">{r.roleId}</span>
              {r.messageId && (
                <span className="text-white/30 text-xs ml-2">(message {r.messageId})</span>
              )}
            </div>
            <button
              onClick={() => remove(r.id)}
              className="text-red-400/70 hover:text-red-400 text-sm"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={add} className="grid grid-cols-3 gap-2">
        <input
          className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
          placeholder="Emoji (ex: 🎮)"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
        />
        <input
          className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
          placeholder="ID du rôle"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
        />
        <input
          className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
          placeholder="ID du message (optionnel)"
          value={messageId}
          onChange={(e) => setMessageId(e.target.value)}
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="col-span-3 bg-ghost-accent hover:opacity-90 transition rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}
