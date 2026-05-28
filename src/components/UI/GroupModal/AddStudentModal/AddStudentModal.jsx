import { useEffect, useState } from "react";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { createPortal } from "react-dom";

export default function AddStudentModal({ isOpen, onClose, onAdd, items = [], initialSelected = [] }) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) { setShouldRender(true); setSelectedIds(initialSelected); setSearch(""); }
    else { const t = setTimeout(() => setShouldRender(false), 300); return () => clearTimeout(t); }
  }, [isOpen]);

  const filtered = items.filter(s => s.full_name?.toLowerCase().includes(search.toLowerCase()));

  if (!shouldRender) return null;

  return createPortal(
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] transition-opacity duration-300 ${!isOpen ? 'opacity-0' : 'opacity-100'}`} onClick={onClose}>
      <div className={`bg-white rounded-2xl w-[480px] max-w-[95vw] shadow-2xl overflow-hidden transition-all duration-300 ${!isOpen ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Talaba qo'shish</h2>
            <p className="text-sm text-slate-500 mt-0.5">Bitta yoki bir nechta talabani tanlang</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg"><CloseRoundedIcon fontSize="small" /></button>
        </div>
        <div className="px-6 py-4 flex flex-col gap-3">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Talaba qidirish..." className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-[#6c35de] outline-none" />
          <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto">
            {filtered.map(s => (
              <label key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => setSelectedIds(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])} className="w-4 h-4 accent-[#6c35de]" />
                <span className="text-sm text-slate-800">{s.full_name}</span>
              </label>
            ))}
            {filtered.length === 0 && <p className="text-center text-sm text-slate-400 py-4">Talaba topilmadi</p>}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Bekor qilish</button>
          <button onClick={() => onAdd(selectedIds)} className="px-4 py-2 text-sm font-semibold text-white bg-[#6c35de] rounded-lg hover:bg-[#5a2cc0] transition-colors">Saqlash</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
