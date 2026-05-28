import { useEffect, useState } from "react";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AddGroupModal from "../../TeacherModal/AddGroupModal/AddGroupModal";
import { api } from "../../../../api/api";

const inputCls = "w-full h-10 px-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6c35de] focus:ring-2 focus:ring-[#6c35de]/20 outline-none transition-all";
const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

export default function AddStudentModal({ isOpen, onClose, onSave, studentToEdit }) {
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const defaultData = { phone: "+998", email: "", fullName: "", birthDate: "", address: "", password: "", photo: null, groups: [] };
  const [studentData, setStudentData] = useState(defaultData);

  const formatDateForInput = (v) => {
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  const handleChange = (e) => setStudentData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (studentToEdit) {
      setStudentData({
        phone: studentToEdit.phone || "+998",
        email: studentToEdit.email || "",
        fullName: studentToEdit.full_name || studentToEdit.fullName || "",
        birthDate: formatDateForInput(studentToEdit.birth_date || studentToEdit.birthDate || ""),
        address: studentToEdit.address || "",
        password: "",
        photo: null,
        groups: studentToEdit.groups || []
      });
    } else if (isOpen) {
      setStudentData(defaultData);
    }
  }, [studentToEdit, isOpen]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const { fullName, email, password, phone, address, birthDate, photo, groups } = studentData;
    const isEditing = Boolean(studentToEdit?.id);
    if (!fullName || !email || !phone || !birthDate) { alert("Iltimos, barcha majburiy maydonlarni to'ldiring!"); return; }
    if (!isEditing && !password) { alert("Iltimos, parolni kiriting!"); return; }

    let cleanPhone = phone.replace(/[^\d+]/g, "").trim();
    if (!cleanPhone.startsWith("+")) cleanPhone = "+" + cleanPhone;

    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("email", email);
    formData.append("phone", cleanPhone);
    formData.append("address", address);
    formData.append("birth_date", birthDate);
    if (photo) formData.append("photo", photo);
    if (password) formData.append("password", password);
    groups.forEach(g => { const id = g?.id || g?.group_id; if (id) formData.append("groups", Number(id)); });

    const request = isEditing
      ? api.patch(`/students/${studentToEdit.id}`, formData)
      : api.post('/students', formData);

    request.then(() => { if (onSave) onSave(); onClose(); })
      .catch(err => {
        const msg = err.response?.data?.message || err.message;
        alert("Xatolik: " + msg);
      });
  };

  return (
    <form
      className={`bg-white h-full w-[720px] max-w-full flex flex-col shadow-2xl overflow-hidden transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      onSubmit={handleSubmit}
      onClick={e => e.stopPropagation()}
    >
      <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{studentToEdit ? "Talabani tahrirlash" : "Talaba qo'shish"}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{studentToEdit ? "Talaba ma'lumotlarini yangilang." : "Yangi talaba qo'shing."}</p>
        </div>
        <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
          <CloseRoundedIcon fontSize="small" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Talaba FIO</label>
              <input type="text" name="fullName" placeholder="FIO ni kiriting" value={studentData.fullName} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tug'ilgan sanasi</label>
              <input type="date" name="birthDate" value={studentData.birthDate} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Manzil</label>
              <input type="text" name="address" placeholder="Manzilni kiriting" value={studentData.address} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Parol</label>
              <input type="password" name="password" placeholder="Parolni kiriting" value={studentData.password} onChange={handleChange} className={inputCls} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" name="email" placeholder="Elektron pochta" value={studentData.email} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Telefon</label>
              <input type="text" name="phone" placeholder="+998..." value={studentData.phone} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Guruh</label>
              <div className="flex flex-wrap gap-1.5 p-2.5 border border-slate-200 rounded-lg min-h-[40px]">
                {studentData.groups.map((g, i) => (
                  <span key={g?.id ?? i} className="flex items-center gap-1 px-2.5 py-1 bg-[#6c35de]/10 text-[#6c35de] rounded-md text-xs font-medium">
                    {g?.name ?? String(g)}
                    <button type="button" onClick={() => setStudentData(prev => ({ ...prev, groups: prev.groups.filter(x => x.id !== g.id) }))} className="text-[#6c35de] leading-none">×</button>
                  </span>
                ))}
                <button type="button" onClick={() => setIsAddGroupModalOpen(true)} className="flex items-center gap-1 text-xs text-[#6c35de] font-medium hover:underline">
                  <AddRoundedIcon style={{ fontSize: 14 }} /><span>Qo'shish</span>
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Surati</label>
              <label
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-5 cursor-pointer hover:border-[#6c35de] hover:bg-[#6c35de]/5 transition-all"
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files?.[0]) setStudentData(prev => ({ ...prev, photo: e.dataTransfer.files[0] })); }}
              >
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => { if (e.target.files?.[0]) setStudentData(prev => ({ ...prev, photo: e.target.files[0] })); }} />
                <CloudUploadOutlinedIcon className="text-slate-400" />
                {studentData.photo ? (
                  <p className="text-sm text-[#6c35de] font-medium">{studentData.photo.name}</p>
                ) : (
                  <p className="text-sm text-slate-500"><span className="text-[#6c35de] font-medium">Click to upload</span> or drag and drop</p>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Bekor qilish</button>
        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[#6c35de] rounded-lg hover:bg-[#5a2cc0] transition-colors">Saqlash</button>
      </div>

      <AddGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => setIsAddGroupModalOpen(false)}
        initialSelectedGroups={studentData.groups}
        onAdd={selected => { setStudentData(prev => ({ ...prev, groups: selected })); setIsAddGroupModalOpen(false); }}
      />
    </form>
  );
}
