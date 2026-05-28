import { useEffect, useState } from "react";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { createPortal } from "react-dom";
import AddGroupModal from "./AddGroupModal/AddGroupModal";
import { api } from "../../../api/api";

const inputCls = "w-full h-10 px-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6c35de] focus:ring-2 focus:ring-[#6c35de]/20 outline-none transition-all";
const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

export default function TeacherModal({ isOpen, onClose, onSubmit, teacherToEdit }) {
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const defaultData = { phone: "+998", email: "", fullName: "", address: "", password: "", photo: null, groups: [] };
  const [teacherData, setTeacherData] = useState(defaultData);

  const handleChange = (e) => setTeacherData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
      if (teacherToEdit) {
        setTeacherData({
          phone: teacherToEdit.phone || "+998",
          email: teacherToEdit.email || "",
          fullName: teacherToEdit.full_name || teacherToEdit.fullName || "",
          address: teacherToEdit.address || "",
          password: "",
          photo: null,
          groups: teacherToEdit.groups || []
        });
      } else {
        setTeacherData(defaultData);
      }
    } else {
      const t = setTimeout(() => { setShouldRender(false); document.body.style.overflow = 'unset'; setTeacherData(defaultData); }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, teacherToEdit]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const { fullName, email, password, phone, address, photo, groups } = teacherData;
    const isEditing = Boolean(teacherToEdit?.id);
    if (!fullName || !email || !phone) { alert("Iltimos, barcha majburiy maydonlarni to'ldiring!"); return; }
    if (!isEditing && !password) { alert("Iltimos, parolni kiriting!"); return; }

    let cleanPhone = String(phone || "").replace(/[^\d+]/g, "").trim();
    if (!cleanPhone.startsWith("+")) cleanPhone = "+" + cleanPhone;

    let finalGroups = [...groups];
    const needsMapping = finalGroups.some(g => !g || typeof g !== 'object' || (!g.id && !g.group_id) || isNaN(Number(g.id || g.group_id)));
    if (needsMapping && finalGroups.length > 0) {
      try {
        const res = await api.get('/groups/all');
        const allGroups = res.data.data;
        finalGroups = finalGroups.map(g => {
          const name = typeof g === 'object' ? (g.name || g.title) : String(g);
          const matched = allGroups.find(ag => ag.name === name || ag.title === name);
          return matched ? { id: matched.id, name: matched.name } : g;
        });
      } catch { /* continue */ }
    }

    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("email", email);
    formData.append("phone", cleanPhone);
    formData.append("address", address || "");
    if (password) formData.append("password", password);
    if (photo) formData.append("photo", photo);
    finalGroups.forEach(g => { const id = g?.id || g?.group_id; if (id) formData.append("groups", Number(id)); });

    if (onSubmit) onSubmit(formData, teacherToEdit, { ...teacherData, groups: finalGroups });
  };

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-end z-[9999] transition-opacity duration-300 ${!isOpen ? 'opacity-0' : 'opacity-100'}`}
      onClick={onClose}
    >
      <form
        className={`bg-white h-full w-[720px] max-w-full flex flex-col shadow-2xl transition-transform duration-300 overflow-hidden ${!isOpen ? 'translate-x-full' : 'translate-x-0'}`}
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{teacherToEdit ? "O'qituvchini tahrirlash" : "O'qituvchi qo'shish"}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{teacherToEdit ? "Bu yerda o'qituvchini yangilashingiz mumkin." : "Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin."}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <CloseRoundedIcon fontSize="small" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-5">
            {/* Left */}
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>O'qituvchi FIO</label>
                <input type="text" name="fullName" placeholder="O'qituvchi FIO ni kiriting" value={teacherData.fullName} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mail</label>
                <input type="email" name="email" placeholder="Elektron pochtani kiriting" value={teacherData.email} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Manzil</label>
                <input type="text" name="address" placeholder="Manzilni kiriting" value={teacherData.address} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Guruh</label>
                <div className="flex flex-wrap gap-1.5 p-2.5 border border-slate-200 rounded-lg min-h-[40px]">
                  {teacherData.groups.map((g, i) => (
                    <span key={g?.id ?? i} className="flex items-center gap-1 px-2.5 py-1 bg-[#6c35de]/10 text-[#6c35de] rounded-md text-xs font-medium">
                      {g?.name ?? g?.title ?? String(g)}
                      <button type="button" onClick={() => setTeacherData(prev => ({ ...prev, groups: prev.groups.filter((_, idx) => idx !== i) }))} className="text-[#6c35de] hover:text-[#5a2cc0] leading-none">×</button>
                    </span>
                  ))}
                  <button type="button" onClick={() => setIsAddGroupModalOpen(true)} className="flex items-center gap-1 text-xs text-[#6c35de] font-medium hover:underline">
                    <AddRoundedIcon style={{ fontSize: 14 }} /><span>Qo'shish</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Telefon raqam</label>
                <input type="text" name="phone" placeholder="Telefon raqamini kiriting" value={teacherData.phone} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Parol</label>
                <input type="password" name="password" placeholder="Parolni kiriting" value={teacherData.password} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Surati</label>
                <label
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-6 cursor-pointer hover:border-[#6c35de] hover:bg-[#6c35de]/5 transition-all"
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={e => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files?.[0]) setTeacherData(prev => ({ ...prev, photo: e.dataTransfer.files[0] })); }}
                >
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => { if (e.target.files?.[0]) setTeacherData(prev => ({ ...prev, photo: e.target.files[0] })); }} />
                  <CloudUploadOutlinedIcon className="text-slate-400" />
                  {teacherData.photo ? (
                    <><p className="text-sm text-slate-700">Tanlandi: <span className="text-[#6c35de] font-medium">{teacherData.photo.name}</span></p><p className="text-xs text-slate-400">O'zgartirish uchun bosing</p></>
                  ) : (
                    <><p className="text-sm text-slate-500"><span className="text-[#6c35de] font-medium">Click to upload</span> or drag and drop</p><p className="text-xs text-slate-400">JPG or PNG (max. 2 MB)</p></>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Bekor qilish</button>
          <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[#6c35de] rounded-lg hover:bg-[#5a2cc0] transition-colors">Saqlash</button>
        </div>
      </form>

      <AddGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => setIsAddGroupModalOpen(false)}
        initialSelectedGroups={teacherData.groups}
        onAdd={selected => { setTeacherData(prev => ({ ...prev, groups: selected })); setIsAddGroupModalOpen(false); }}
      />
    </div>,
    document.body
  );
}
