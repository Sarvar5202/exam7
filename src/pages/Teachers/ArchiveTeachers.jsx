import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from '../../api/api';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ConfirmDialog from "../../components/UI/ConfirmDialog/ConfirmDialog";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import TeacherModal from "../../components/UI/TeacherModal/TeacherModal";

const actionBtn = "w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors";

export default function ArchiveTeachers() {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState({ isOpen: false, teacherId: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, teacherId: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const formatDate = (s) => {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  };

  const fetchArchivedTeachers = () => {
    setIsLoading(true);
    api.get('/teachers/archive').then(res => setTeacherData(res.data.data || [])).catch(err => console.log(err.message)).finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchArchivedTeachers(); }, []);

  const actualRestoreTeacher = (id) => {
    setIsLoading(true);
    api.post(`/teachers/${id}/restore`).then(() => setTeacherData(prev => prev.filter(t => t.id !== id))).catch(err => console.error(err.message)).finally(() => setIsLoading(false));
  };

  const actualDeleteTeacher = (id) => {
    setIsLoading(true);
    api.delete(`/teachers/${id}/force`).then(() => setTeacherData(prev => prev.filter(t => t.id !== id))).catch(err => console.error(err.message)).finally(() => setIsLoading(false));
  };

  return (
    <div className="pt-6 flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#1a1a2e] m-0">O'qituvchilar Arxiv</h1>
          <button onClick={() => navigate('/dashboard/teachers')} className="flex items-center gap-1 bg-[#6c35de] text-white rounded-[10px] px-5 py-[10px] text-sm font-semibold hover:bg-[#5a2cc0] transition-colors">
            <KeyboardArrowLeftRoundedIcon fontSize="small" /><span>Orqaga</span>
          </button>
        </div>
        <p className="text-sm text-[#8a8a9a]">Arxivdagi o'qituvchilar ro'yxati.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-auto relative" style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.2s', minHeight: 150 }}>
          {isLoading && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 10 }}>
              <CircularProgress sx={{ color: '#6c35de' }} />
            </Box>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Nomi</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Guruh</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Telefon</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Sana</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-500">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {teacherData.map((teacher, i) => (
                <tr key={teacher.id ?? i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#6c35de] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {teacher.full_name?.charAt(0).toUpperCase() || 'T'}
                      </div>
                      <span className="font-medium text-slate-800">{teacher.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {teacher.groups?.map((g, idx) => <span key={g?.id ?? idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">{g?.name ?? String(g)}</span>)}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{teacher.phone}</td>
                  <td className="px-5 py-3 text-slate-700">{teacher.email}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(teacher.created_at)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setRestoreConfirm({ isOpen: true, teacherId: teacher.id })} className={actionBtn} title="Tiklash"><RestoreOutlinedIcon fontSize="small" /></button>
                      <button onClick={() => { setSelectedTeacher(teacher); setIsModalOpen(true); }} className={actionBtn}><EditOutlinedIcon fontSize="small" /></button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, teacherId: teacher.id })} className={actionBtn}><DeleteOutlineRoundedIcon fontSize="small" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TeacherModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedTeacher(null); }} onSubmit={() => { fetchArchivedTeachers(); setIsModalOpen(false); }} teacherToEdit={selectedTeacher} />
      <ConfirmDialog isOpen={restoreConfirm.isOpen} onClose={() => setRestoreConfirm({ isOpen: false, teacherId: null })} onConfirm={() => { const id = restoreConfirm.teacherId; setRestoreConfirm({ isOpen: false, teacherId: null }); if (id) actualRestoreTeacher(id); }} title="O'qituvchini tiklash" message="Arxivdan tiklamoqchimisiz?" />
      <ConfirmDialog isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false, teacherId: null })} onConfirm={() => { const id = deleteConfirm.teacherId; setDeleteConfirm({ isOpen: false, teacherId: null }); if (id) actualDeleteTeacher(id); }} title="O'qituvchini o'chirish" message="Bu amalni bekor qilib bo'lmaydi!" />
    </div>
  );
}
