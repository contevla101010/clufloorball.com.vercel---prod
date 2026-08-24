import { motion } from "framer-motion";

export const WhatsAppButton = ({ settings }) => {
  const number = (settings.contacts?.whatsapp || "").replace(/\D/g, "");
  if (!number) return null;
  return (
    <motion.a
      href={`https://wa.me/${number}?text=${encodeURIComponent("Ciao! Vorrei provare il floorball con Centro Lombardia Unihockey.")}`}
      target="_blank"
      rel="noreferrer"
      data-cursor
      data-testid="whatsapp-float"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.6, type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 border border-white/15 bg-brand-ink/80 px-4 py-3 font-manrope text-xs font-semibold uppercase tracking-widest text-brand-off backdrop-blur-xl transition-colors hover:border-brand-electric hover:text-brand-electric"
      aria-label="Scrivici su WhatsApp"
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#25D366] text-brand-ink">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.39-8.24 8.39Z" />
        </svg>
      </span>
      WhatsApp
    </motion.a>
  );
};
