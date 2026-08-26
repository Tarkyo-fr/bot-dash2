import { BACKEND_URL } from "../api/client";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-ghost-panel p-10 rounded-2xl shadow-xl text-center max-w-sm w-full border border-white/5">
        <h1 className="text-2xl font-bold mb-2">Bot Dashboard</h1>
        <p className="text-white/50 mb-8 text-sm">
          Connecte-toi avec Discord pour gérer le bot sur tes serveurs.
        </p>
        <a
          href={`${BACKEND_URL}/auth/discord`}
          className="block w-full bg-ghost-accent hover:opacity-90 transition rounded-lg py-3 font-semibold"
        >
          Se connecter avec Discord
        </a>
      </div>
    </div>
  );
}
