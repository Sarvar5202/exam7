import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from '../../api/api';
import { toast } from '../../components/UI/Toast/Toast';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import TeacherModal from "../../components/UI/TeacherModal/TeacherModal";
import ConfirmDialog from "../../components/UI/ConfirmDialog/ConfirmDialog";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const actionBtn = "w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors";

export default function Teachers() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teacherData, setTeacherData] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, teacherId: null });

  const formatDate = (s) => {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  };

  const fetchTeachers = () => {
    setIsLoading(true);
    api.get('/teachers').then(res => setTeacherData(res.data.data)).catch(() => {}).finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleTeacherSubmit = (payload, teacherToEdit, localData) => {
    setIsLoading(true);
    const request = teacherToEdit?.id ? api.patch(`/teachers/${teacherToEdit.id}`, payload) : api.post('/teachers', payload);
    request.then(res => {
      if (teacherToEdit?.id) {
        setTeacherData(prev => prev.map(t => t.id === teacherToEdit.id ? { ...t, full_name: localData?.fullName || t.full_name, email: localData?.email || t.email, phone: localData?.phone || t.phone, address: localData?.address || t.address, groups: localData?.groups || t.groups } : t));
      } else {
        if (res.data?.data) setTeacherData(prev => [res.data.data, ...prev]);
        else fetchTeachers();
      }
      setIsModalOpen(false); setSelectedTeacher(null);
      toast.success(teacherToEdit?.id ? "O'qituvchi yangilandi" : "O'qituvchi qo'shildi");
    }).catch(err => {
      if (err.response?.status === 304) { setIsModalOpen(false); setSelectedTeacher(null); return; }
      toast.error("Xatolik yuz berdi");
    }).finally(() => setIsLoading(false));
  };

  const actualDeleteTeacher = (tid) => {
    setIsLoading(true);
    api.delete(`/teachers/${tid}`)
      .then(res => {
        if (res.status === 200 || res.status === 204) {
          setTeacherData(prev => prev.filter(t => t.id !== tid));
          toast.success("O'qituvchi o'chirildi");
        }
      })
      .catch(() => toast.error("O'chirishda xatolik yuz berdi"))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="pt-6 flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#1a1a2e] m-0">O'qituvchilar</h1>
          <button onClick={() => { setSelectedTeacher(null); setIsModalOpen(true); }} className="flex items-center gap-1 bg-[#6c35de] text-white rounded-[10px] px-5 py-[10px] text-sm font-semibold hover:bg-[#5a2cc0] transition-colors">
            <AddRoundedIcon fontSize="small" /><span>O'qituvchi qo'shish</span>
          </button>
        </div>
        <p className="text-sm text-[#8a8a9a] leading-relaxed m-0">
          Ushbu sahifada siz o'qituvchilar ro'yxatini va ularning ma'lumotlarini topasiz.
        </p>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm flex flex-col flex-1 min-h-0">
        {/* Table header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <FilterListRoundedIcon fontSize="small" />Filters
            </button>
            <button onClick={() => navigate('/dashboard/teachers/archive')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <ArchiveOutlinedIcon fontSize="small" />Arxiv
            </button>
          </div>
          <input type="text" placeholder="Search" className="h-9 px-3 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-[#6c35de] outline-none w-full sm:w-[220px]" />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto relative" style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          {isLoading && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 10 }}>
              <CircularProgress sx={{ color: '#6c35de' }} />
            </Box>
          )}

          {/* Desktop jadval */}
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold text-slate-500 w-10"><input type="checkbox" /></th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Nomi ↓</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Guruh</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Telefon</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Manzil</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Sana</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-500">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {teacherData.map((teacher, i) => (
                <tr key={teacher.id ?? i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3"><input type="checkbox" /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      {teacher.photo ? (
                        <img src={`https://najot-edu.softwareengineer.uz/files/${teacher.photo}`} alt={teacher.full_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#6c35de] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {teacher.full_name?.charAt(0).toUpperCase() || 'T'}
                        </div>
                      )}
                      <span className="font-medium text-slate-800">{teacher.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {teacher.groups?.map((g, idx) => {
                        const key = g?.id ?? `${g?.name ?? String(g)}-${idx}`;
                        const label = g?.name ?? g?.title ?? String(g);
                        return <span key={key} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">{label}</span>;
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{teacher.phone}</td>
                  <td className="px-5 py-3 text-slate-700">{teacher.email}</td>
                  <td className="px-5 py-3 text-slate-700">{teacher.address}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(teacher.created_at)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className={actionBtn}><VisibilityOutlinedIcon fontSize="small" /></button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, teacherId: teacher.id })} className={actionBtn}><DeleteOutlineRoundedIcon fontSize="small" /></button>
                      <button onClick={() => { setSelectedTeacher(teacher); setIsModalOpen(true); }} className={actionBtn}><EditOutlinedIcon fontSize="small" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobil card ko'rinishi */}
          <div className="md:hidden flex flex-col divide-y divide-slate-50">
            {teacherData.map((teacher, i) => (
              <div key={teacher.id ?? i} className="flex items-center gap-3 px-4 py-3">
                {teacher.photo ? (
                  <img src={`https://najot-edu.softwareengineer.uz/files/${teacher.photo}`} alt={teacher.full_name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#6c35de] text-white flex items-center justify-center text-base font-bold flex-shrink-0">
                    {teacher.full_name?.charAt(0).toUpperCase() || 'T'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{teacher.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">{teacher.phone}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teacher.groups?.slice(0, 2).map((g, idx) => {
                      const key = g?.id ?? `${g?.name ?? String(g)}-${idx}`;
                      const label = g?.name ?? g?.title ?? String(g);
                      return <span key={key} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{label}</span>;
                    })}
                    {(teacher.groups?.length ?? 0) > 2 && (
                      <span className="text-xs text-slate-400">+{teacher.groups.length - 2}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setDeleteConfirm({ isOpen: true, teacherId: teacher.id })} className={actionBtn}><DeleteOutlineRoundedIcon fontSize="small" /></button>
                  <button onClick={() => { setSelectedTeacher(teacher); setIsModalOpen(true); }} className={actionBtn}><EditOutlinedIcon fontSize="small" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Previous</button>
          <div className="flex items-center gap-1">
            {[1,2,3,'...',8,9,10].map((p, i) => p === '...' ? <span key={i} className="px-2 text-slate-400">...</span> :
              <button key={i} className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg border transition-colors ${p === 1 ? 'bg-[#6c35de] text-white border-[#6c35de]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}</button>
            )}
          </div>
          <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</button>
        </div>
      </div>

      <TeacherModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedTeacher(null); }} onSubmit={handleTeacherSubmit} teacherToEdit={selectedTeacher} />
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, teacherId: null })}
        onConfirm={() => { const id = deleteConfirm.teacherId; setDeleteConfirm({ isOpen: false, teacherId: null }); if (id) actualDeleteTeacher(id); }}
        title="O'qituvchini o'chirish"
        message="Rostdan ham o'chirishni hohlaysizmi?"
      />
    </div>
  );
}
