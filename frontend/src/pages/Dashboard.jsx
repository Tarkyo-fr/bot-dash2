import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Dashboard() {
  const [guilds, setGuilds] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => navigate("/login"));

    api.get("/api/guilds").then((res) => setGuilds(res.data.guilds));
  }, [navigate]);

  const logout = async () => {
    await api.post("/auth/logout");
    navigate("/login");
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold">
          {user ? `Salut, ${user.username} 👋` : "Chargement..."}
        </h1>
        <button onClick={logout} className="text-sm text-white/50 hover:text-white">
          Se déconnecter
        </button>
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
          <Link
            key={g.id}
            to={`/guild/${g.id}`}
            className="bg-ghost-panel border border-white/5 rounded-xl p-5 hover:border-ghost-accent transition flex items-center gap-4"
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
            <div>
              <p className="font-semibold">{g.name}</p>
              <p className="text-xs text-white/40">
                {g.hasConfig ? "Configuré" : "Non configuré"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
