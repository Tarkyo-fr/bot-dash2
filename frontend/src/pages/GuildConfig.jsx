import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../api/client";

const FIELDS = [
  { key: "welcomeMessage", label: "Message de bienvenue", placeholder: "Bienvenue {user} sur le serveur !" },
  { key: "welcomeChannelId", label: "ID du salon de bienvenue", placeholder: "123456789012345678" },
  { key: "autoRoleId", label: "ID du rôle automatique", placeholder: "123456789012345678" },
  { key: "prefix", label: "Préfixe des commandes", placeholder: "!" },
];

export default function GuildConfig() {
  const { guildId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error

  useEffect(() => {
    api
      .get(`/api/guilds/${guildId}/config`)
      .then((res) => setForm(res.data.config))
      .catch(() => navigate("/login"));
  }, [guildId, navigate]);

  const save = async (e) => {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await api.put(`/api/guilds/${guildId}/config`, form);
      setStatus(res.data.botghostSync === "error" ? "error" : "saved");
    } catch {
      setStatus("error");
    }
  };

  if (!form) return <p className="p-8 text-white/40">Chargement...</p>;

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <Link to="/dashboard" className="text-white/40 text-sm hover:text-white">
        ← Retour
      </Link>

      <h1 className="text-xl font-bold mt-3 mb-6">Configuration du serveur</h1>

      <form onSubmit={save} className="bg-ghost-panel border border-white/5 rounded-2xl p-6 space-y-5">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-sm text-white/50 mb-1">{f.label}</label>
            <input
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-ghost-accent"
              placeholder={f.placeholder}
              value={form[f.key] || ""}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full bg-ghost-accent hover:opacity-90 transition rounded-lg py-3 font-semibold disabled:opacity-50"
        >
          {status === "saving" ? "Sauvegarde..." : "Sauvegarder"}
        </button>

        {status === "saved" && (
          <p className="text-green-400 text-sm text-center">
            Config sauvegardée et synchronisée avec BotGhost ✅
          </p>
        )}
        {status === "error" && (
          <p className="text-yellow-400 text-sm text-center">
            Sauvegardée en base, mais la sync BotGhost a échoué (vérifie le .env du backend).
          </p>
        )}
      </form>
    </div>
  );
}
