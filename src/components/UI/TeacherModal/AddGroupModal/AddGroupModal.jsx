import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { createPortal } from "react-dom";
import { api } from '../../../../api/api';
import { useEffect, useState } from "react";

export default function AddGroupModal({ isOpen, onClose, onAdd, initialSelectedGroups = [] }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen && groups.length > 0) {
      const ids = initialSelectedGroups.map(g => {
        let idVal = typeof g === 'object' ? (g.id || g.group_id) : null;
        if (idVal && !isNaN(Number(idVal))) return Number(idVal);
        if (typeof g === 'number' || (typeof g === 'string' && !isNaN(Number(g)))) return Number(g);
        const name = typeof g === 'object' ? (g.name || g.title) : String(g);
        const matched = groups.find(ag => ag.name === name || ag.title === name);
        return matched ? Number(matched.id) : null;
      }).filter(Boolean);
      setSelectedGroupIds(ids);
    }
  }, [isOpen, initialSelectedGroups, groups]);

  useEffect(() => {
    if (isOpen && groups.length === 0) {
      api.get('/groups/all').then(res => setGroups(res.data.data)).catch(err => console.log(err.message));
    }
  }, [isOpen, groups.length]);

  if (!isOpen) return null;

  const filtered = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  const handleCheckbox = (id) => {
    setSelectedGroupIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAdd = () => {
    const selected = groups.filter(g => selectedGroupIds.includes(g.id)).map(g => ({ id: g.id, name: g.name }));
    onAdd(selected);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[400px] max-w-[90vw] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Guruhga biriktirish</h2>
            <p className="text-sm text-slate-500 mt-0.5">Bir yoki bir nechta guruhni tanlang</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <CloseRoundedIcon fontSize="small" />
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-4">
            <SearchRoundedIcon fontSize="small" className="text-slate-400" />
            <input type="text" placeholder="Guruh qidirish..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm w-full text-slate-900 placeholder:text-slate-400" />
          </div>
          <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
            {filtered.map(group => {
              const checked = selectedGroupIds.includes(group.id);
              return (
                <label key={group.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="checkbox" checked={checked} onChange={() => handleCheckbox(group.id)}
                    className="w-4 h-4 accent-[#6c35de]" />
                  <span className="text-sm text-slate-800">
                    {group.name} <span className="text-slate-400 text-xs">({group.course?.name})</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Bekor qilish</button>
          <button onClick={handleAdd} className="px-4 py-2 text-sm font-semibold text-white bg-[#6c35de] rounded-lg hover:bg-[#5a2cc0] transition-colors">Qo'shish</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
