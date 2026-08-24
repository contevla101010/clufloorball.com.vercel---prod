import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { CTA } from "@/components/site/CTA";

const field =
  "w-full border-b border-white/20 bg-transparent px-0 py-3 font-manrope text-lg text-brand-off placeholder:text-brand-off/35 focus:border-brand-electric focus:outline-none transition-colors";

export const TrialForm = ({ courses = [] }) => {
  const [form, setForm] = useState({ nome: "", eta: "", telefono: "", email: "", corso: "" });
  const [privacy, setPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!privacy) {
      toast.error("Accetta la privacy per continuare");
      return;
    }
    setLoading(true);
    try {
      await api.post("/trial-requests", { ...form, corso: form.corso || "Da definire", privacy });
      setDone(true);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="prova" className="relative">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[320px] flex-col justify-center"
            data-testid="trial-success"
          >
            <h3 className="font-anton text-5xl uppercase leading-[0.9] text-brand-off md:text-7xl">
              Ci vediamo <span className="text-brand-electric">in campo.</span>
            </h3>
            <p className="mt-6 max-w-md font-manrope text-lg text-brand-off/70">
              Abbiamo ricevuto la tua richiesta. Ti contatteremo per organizzare la prova.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            exit={{ opacity: 0 }}
            className="grid gap-6"
            data-testid="trial-form"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <input required className={field} placeholder="Nome e cognome" value={form.nome} onChange={set("nome")} data-testid="trial-nome" />
              <input required className={field} placeholder="Età" value={form.eta} onChange={set("eta")} data-testid="trial-eta" />
              <input required className={field} placeholder="Telefono / WhatsApp" value={form.telefono} onChange={set("telefono")} data-testid="trial-telefono" />
              <input required type="email" className={field} placeholder="Email" value={form.email} onChange={set("email")} data-testid="trial-email" />
            </div>
            <select className={`${field} appearance-none`} value={form.corso} onChange={set("corso")} data-testid="trial-corso">
              <option value="" className="bg-brand-ink2">Scegli il corso / categoria</option>
              {courses.map((c) => (
                <option key={c.id} value={c.categoria} className="bg-brand-ink2">
                  {c.categoria} — {c.eta}
                </option>
              ))}
            </select>

            <label className="flex items-start gap-3 font-manrope text-sm text-brand-off/60" data-testid="trial-privacy-label">
              <input
                type="checkbox"
                checked={privacy}
                onChange={(e) => setPrivacy(e.target.checked)}
                className="mt-1 h-4 w-4 accent-brand-electric"
                data-testid="trial-privacy"
              />
              Acconsento al trattamento dei dati per essere ricontattato/a (Privacy Policy).
            </label>

            <CTA type="submit" disabled={loading} className="mt-2 w-full py-5 text-base sm:w-auto" data-testid="trial-submit">
              {loading ? "Invio…" : "Voglio provare"}
            </CTA>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
