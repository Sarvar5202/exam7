import { useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { api } from '../../api/api';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import StudentModal from "../../components/UI/StudentModal/StudentModal";
import ConfirmDialog from "../../components/UI/ConfirmDialog/ConfirmDialog";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const actionBtn = "w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors";

export default function Students() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentData, setStudentData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, studentId: null });

  const formatDate = (s) => {
    if (!s) return "-";
    const d = new Date(s);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("ru-RU");
  };

  const fetchStudents = (targetPage) => {
    setIsLoading(true);
    return api(`/students?page=${targetPage}&limit=3`).then(res => {
      const data = res.data.data || [];
      if (data.length > 0 || targetPage === 1) { setStudentData(data); setPage(targetPage); }
      if (res.data.meta?.last_page) setTotalPages(res.data.meta.last_page);
      else if (res.data.totalPages) setTotalPages(res.data.totalPages);
      setIsLoading(false);
    }).catch(err => { console.log(err.message); setIsLoading(false); });
  };

  useEffect(() => { startTransition(async () => { await fetchStudents(1); }); }, []);

  const getPaginationGroup = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const actualDeleteStudent = (id) => {
    setIsLoading(true);
    api.delete(`/students/${id}`).then(res => { if (res.status === 200 || res.status === 204) setStudentData(prev => prev.filter(s => s.id !== id)); }).catch(err => alert("Xatolik: " + err.message)).finally(() => setIsLoading(false));
  };

  return (
    <div className="pt-6 flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#1a1a2e] m-0">Talabalar</h1>
          <button onClick={() => { setSelectedStudent(null); setIsModalOpen(true); }} className="flex items-center gap-1 bg-[#6c35de] text-white rounded-[10px] px-5 py-[10px] text-sm font-semibold hover:bg-[#5a2cc0] transition-colors">
            <AddRoundedIcon fontSize="small" /><span>Talaba qo'shish</span>
          </button>
        </div>
        <p className="text-sm text-[#8a8a9a] leading-relaxed m-0">Ushbu sahifada talabalar ro'yxati va ularning ma'lumotlari keltirilgan.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <FilterListRoundedIcon fontSize="small" />Filters
            </button>
            <button onClick={() => navigate('/dashboard/students/archive')} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <ArchiveOutlinedIcon fontSize="small" />Arxiv
            </button>
          </div>
          <input type="text" placeholder="Search" className="h-9 px-3 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-[#6c35de] outline-none w-[220px]" />
        </div>

        <div className="flex-1 overflow-auto relative" style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.2s', minHeight: 150 }}>
          {isLoading && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 10 }}>
              <CircularProgress sx={{ color: '#6c35de' }} />
            </Box>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold text-slate-500 w-10"><input type="checkbox" /></th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">FIO ↓</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Guruh</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Telefon</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Tug'ilgan sana</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Manzil</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-500">Sana</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-500">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {studentData.map((student) => (
                <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3"><input type="checkbox" /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      {student.photo ? (
                        <img
                          src={`https://najot-edu.softwareengineer.uz/files/${student.photo}`}
                          alt={student.full_name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#6c35de] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {student.full_name?.charAt(0).toUpperCase() || 'T'}
                        </div>
                      )}
                      <span className="font-medium text-slate-800">{student.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {student.groups?.map((g, i) => <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">{g.name}</span>)}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{student.phone}</td>
                  <td className="px-5 py-3 text-slate-700">{student.email}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(student.birth_date)}</td>
                  <td className="px-5 py-3 text-slate-700">{student.address}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(student.created_at)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className={actionBtn}><VisibilityOutlinedIcon fontSize="small" /></button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, studentId: student.id })} className={actionBtn}><DeleteOutlineRoundedIcon fontSize="small" /></button>
                      <button onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }} className={actionBtn}><EditOutlinedIcon fontSize="small" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <button onClick={() => { if (page > 1) startTransition(async () => { await fetchStudents(page - 1); }); }} disabled={page === 1 || isPending || isLoading} className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">← Previous</button>
          <div className="flex items-center gap-1">
            {getPaginationGroup().map((p, i) => p === '...' ? <span key={i} className="px-2 text-slate-400">...</span> :
              <button key={i} onClick={() => { if (page !== p) startTransition(async () => { await fetchStudents(p); }); }} disabled={isPending || isLoading} className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg border transition-colors ${page === p ? 'bg-[#6c35de] text-white border-[#6c35de]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}</button>
            )}
          </div>
          <button onClick={() => { if (studentData.length === 3) startTransition(async () => { await fetchStudents(page + 1); }); }} disabled={studentData.length < 3 || isPending || isLoading} className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next →</button>
        </div>
      </div>

      <StudentModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedStudent(null); }} onSave={() => fetchStudents(page)} studentToEdit={selectedStudent} />
      <ConfirmDialog isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false, studentId: null })} onConfirm={() => { const id = deleteConfirm.studentId; setDeleteConfirm({ isOpen: false, studentId: null }); if (id) actualDeleteStudent(id); }} title="Talabani o'chirish" message="Rostdan ham o'chirishni hohlaysizmi?" />
    </div>
  );
}
