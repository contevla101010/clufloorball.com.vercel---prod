import { useRef, useState } from "react";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import api, { formatApiError } from "@/lib/api";

const inputCls =
  "w-full rounded-none border border-white/10 bg-brand-ink px-3 py-2 font-manrope text-sm text-brand-off focus:border-brand-electric focus:outline-none";

export const ImageUpload = ({ label, value, onChange }) => {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onChange(data.url);
      toast.success("Immagine caricata");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="block">
      <span className="mb-1 block font-manrope text-[11px] uppercase tracking-widest text-brand-off/50">{label}</span>
      <div className="flex items-start gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden border border-white/10 bg-brand-ink">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] text-brand-off/30">—</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input className={inputCls} placeholder="URL immagine" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 border border-white/15 px-3 py-1.5 font-manrope text-[11px] font-bold uppercase tracking-widest text-brand-off transition-colors hover:border-brand-electric disabled:opacity-50"
          >
            <UploadCloud size={13} /> {busy ? "Carico…" : "Carica file"}
          </button>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
};
