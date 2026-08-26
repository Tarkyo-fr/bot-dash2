import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import BotStatusBadge from "../components/BotStatusBadge";

function inviteUrl(botClientId, guildId) {
  const params = new URLSearchParams({
    client_id: botClientId,
    scope: "bot applications.commands",
    permissions: "8", // Administrator par défaut — ajuste selon les besoins réels du bot
    guild_id: guildId,
    disable_guild_select: "true",
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

export default function Dashboard() {
  const [guilds, setGuilds] = useState(null);
  const [botClientId, setBotClientId] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => navigate("/login"));

    api.get("/api/guilds").then((res) => {
      setGuilds(res.data.guilds);
      setBotClientId(res.data.botClientId);
    });
  }, [navigate]);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("bg_token");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">
          {user ? `Salut, ${user.username} 👋` : "Chargement..."}
        </h1>
        <button onClick={logout} className="text-sm text-white/50 hover:text-white">
          Se déconnecter
        </button>
      </div>

      <div className="mb-8">
        <BotStatusBadge />
      </div>

      <h2 className="text-white/50 text-sm mb-3 uppercase tracking-wide">Tes serveurs</h2>

      {!guilds && <p className="text-white/40">Chargement des serveurs...</p>}
      {guilds?.length === 0 && (
        <p className="text-white/40">
          Aucun serveur où tu as les droits de gestion n'a été trouvé.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {guilds?.map((g) => (
          <div
            key={g.id}
            className="bg-ghost-panel border border-white/5 rounded-xl p-5 flex items-center gap-4"
          >
            {g.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`}
                className="w-12 h-12 rounded-full"
                alt=""
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold">
                {g.name[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{g.name}</p>
              <p className="text-xs text-white/40">
                {g.hasConfig ? "Configuré" : "Non configuré"}
              </p>
            </div>

            {g.botPresent === false && botClientId ? (
              <a
                href={inviteUrl(botClientId, g.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-ghost-accent hover:opacity-90 transition rounded-lg px-3 py-2 font-semibold whitespace-nowrap"
              >
                Ajouter le bot
              </a>
            ) : (
              <Link
                to={`/guild/${g.id}`}
                className="text-xs border border-white/10 hover:border-ghost-accent transition rounded-lg px-3 py-2 whitespace-nowrap"
              >
                Configurer
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
