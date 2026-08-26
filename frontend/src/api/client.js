import axios from "axios";

// En local : crée un fichier .env avec VITE_API_URL=http://localhost:3001
// Sur Netlify : configure la variable d'env VITE_API_URL = URL de ton backend
export const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: { "Cache-Control": "no-cache" },
});

// Attache le token de session (stocké en localStorage après le login OAuth2)
// à chaque requête.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bg_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
