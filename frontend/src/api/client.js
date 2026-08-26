import axios from "axios";

// En local : crée un fichier .env avec VITE_API_URL=http://localhost:3001
// Sur Netlify : configure la variable d'env VITE_API_URL = URL de ton backend Render
// (ex: https://ton-backend.onrender.com)
export const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: { "Cache-Control": "no-cache" },
});

// Attache le token de session (stocké en localStorage après le login OAuth2)
// à chaque requête. On n'utilise plus de cookie de session : les cookies
// cross-domain (Netlify <-> Railway) sont bloqués par défaut par Safari et
// de plus en plus par Chrome, donc on passe par un token Bearer classique.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bg_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
