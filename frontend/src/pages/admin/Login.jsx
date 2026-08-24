import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { CTA } from "@/components/site/CTA";

const field =
  "w-full border-b border-white/20 bg-transparent px-0 py-3 font-manrope text-lg text-brand-off placeholder:text-brand-off/35 focus:border-brand-electric focus:outline-none transition-colors";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-ink px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <p className="font-manrope text-xs font-bold uppercase tracking-[0.3em] text-brand-electric">Area riservata</p>
        <h1 className="mt-4 font-anton text-5xl uppercase leading-[0.9] text-brand-off">CMS<br />Centro Lombardia</h1>
        <form onSubmit={submit} className="mt-10 grid gap-6" data-testid="login-form">
          <input required type="email" className={field} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email" />
          <input required type="password" className={field} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-password" />
          {error && <p className="font-manrope text-sm text-red-400" data-testid="login-error">{error}</p>}
          <CTA type="submit" disabled={loading} withArrow={false} className="mt-2 w-full" data-testid="login-submit">
            {loading ? "Accesso…" : "Entra"}
          </CTA>
        </form>
      </motion.div>
    </div>
  );
}
