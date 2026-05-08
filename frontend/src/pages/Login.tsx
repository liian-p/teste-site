import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { Lock, Loader2 } from "lucide-react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/login", { password });
      sessionStorage.setItem("eln_auth", "1");
      navigate("/dashboard");
    } catch {
      setError("Senha incorreta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / título */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-widest text-[#1e90ff]">ELN</h1>
          <p className="text-[#8a8d91] text-sm tracking-widest mt-1">FINANCE TERMINAL</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-[#161920] border border-[#2b2e35] rounded-2xl p-8 space-y-5 shadow-2xl"
        >
          <div>
            <label className="block text-xs text-[#8a8d91] font-bold mb-2 tracking-widest">
              SENHA DE ACESSO
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8d91]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#0f1115] border border-[#2b2e35] rounded-xl pl-11 pr-4 py-3.5
                           text-white placeholder-[#3a3d42] focus:outline-none focus:border-[#1e90ff]
                           transition-colors text-sm"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e90ff] hover:bg-[#1466b8] disabled:opacity-60
                       text-white font-bold py-3.5 rounded-xl transition-colors
                       flex items-center justify-center gap-2 text-sm tracking-wide"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "AUTENTICANDO..." : "ACESSAR TERMINAL"}
          </button>
        </form>

        <p className="text-center text-xs text-[#454950] mt-6">
          Conexão Criptografada • ELN Finance
        </p>
      </div>
    </div>
  );
}
