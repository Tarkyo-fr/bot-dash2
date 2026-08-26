import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("bg_token", token);
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login?error=missing_token", { replace: true });
    }
  }, [searchParams, navigate]);

  return <p className="p-8 text-white/40">Connexion en cours...</p>;
}
