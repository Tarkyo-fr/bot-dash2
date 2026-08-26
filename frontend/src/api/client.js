import axios from "axios";

// En local : crée un fichier .env avec VITE_API_URL=http://localhost:3001
// Sur Netlify : configure la variable d'env VITE_API_URL = URL de ton backend Render
// (ex: https://ton-backend.onrender.com)
export const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // indispensable pour envoyer le cookie de session cross-domain
});
