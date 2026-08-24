import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { CTA } from "@/components/site/CTA";

const field =
  "w-full border-b border-white/20 bg-transparent px-0 py-3 font-manrope text-base text-brand-off placeholder:text-brand-off/35 focus:border-brand-electric focus:outline-none transition-colors";

const PACKAGES = ["Bronze", "Silver", "Gold", "Diamond"];

export const SponsorForm = ({ pkg, onPkg }) => {
  const [form, setForm] = useState({ nome: "", azienda: "", email: "", telefono: "", messaggio: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/sponsor-leads", { ...form, pacchetto: pkg || "Da definire" });
      setDone(true);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="sponsor-form" className="border border-white/10 bg-brand-ink2 p-7 md:p-10">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="sponsor-success" className="py-8">
            <h3 className="font-anton text-4xl uppercase text-brand-off md:text-5xl">Ci sentiamo presto.</h3>
            <p className="mt-4 font-manrope text-brand-off/70">
              Abbiamo ricevuto la tua richiesta. Ti contatteremo per parlarne.
            </p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} exit={{ opacity: 0 }} className="grid gap-6" data-testid="sponsor-form">
            <div className="grid gap-6 sm:grid-cols-2">
              <input required className={field} placeholder="Nome" value={form.nome} onChange={set("nome")} data-testid="sponsor-nome" />
              <input required className={field} placeholder="Azienda" value={form.azienda} onChange={set("azienda")} data-testid="sponsor-azienda" />
              <input required type="email" className={field} placeholder="Email" value={form.email} onChange={set("email")} data-testid="sponsor-email" />
              <input required className={field} placeholder="Telefono" value={form.telefono} onChange={set("telefono")} data-testid="sponsor-telefono" />
            </div>
            <select className={`${field} appearance-none`} value={pkg} onChange={(e) => onPkg(e.target.value)} data-testid="sponsor-pacchetto">
              <option value="" className="bg-brand-ink2">Pacchetto di interesse</option>
              {PACKAGES.map((p) => (
                <option key={p} value={p} className="bg-brand-ink2">{p}</option>
              ))}
            </select>
            <textarea rows={3} className={field} placeholder="Messaggio (opzionale)" value={form.messaggio} onChange={set("messaggio")} data-testid="sponsor-messaggio" />
            <CTA type="submit" disabled={loading} className="w-full sm:w-auto" data-testid="sponsor-submit">
              {loading ? "Invio…" : "Parliamone"}
            </CTA>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
