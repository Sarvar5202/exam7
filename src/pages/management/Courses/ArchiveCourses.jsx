import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import { api } from "../../../api/api";
import ConfirmDialog from "../../../components/UI/ConfirmDialog/ConfirmDialog";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function ArchiveCourses() {
  const navigate = useNavigate();
  const [courses, setCourses]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState({ isOpen: false, courseId: null });
  const [deleteConfirm,  setDeleteConfirm]  = useState({ isOpen: false, courseId: null });

  const fetchArchivedCourses = () => {
    setIsLoading(true);
    api.get('/courses/archive')
      .then(res => setCourses(res.data.data || []))
      .catch(err => console.log(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchArchivedCourses(); }, []);

  const actualRestoreCourse = (id) => {
    setIsLoading(true);
    api.post(`/courses/${id}/restore`)
      .then(() => setCourses(prev => prev.filter(c => c.id !== id)))
      .catch(err => alert("Xatolik: " + (err.response?.data?.message || err.message)))
      .finally(() => setIsLoading(false));
  };

  const actualDeleteCourseForever = (id) => {
    setIsLoading(true);
    api.delete(`/courses/${id}/force`)
      .then(() => setCourses(prev => prev.filter(c => c.id !== id)))
      .catch(err => alert("Xatolik: " + (err.response?.data?.message || err.message)))
      .finally(() => setIsLoading(false));
  };

  const CARD_COLORS = ['#f0fdf4','#eff6ff','#fdf4ff','#fff7ed','#f0f9ff','#fefce8'];

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/management/courses')}
          className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <KeyboardArrowLeftRoundedIcon fontSize="small" />
        </button>
        <h2 className="text-lg font-bold text-slate-900">Kurslar (Arxiv)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 relative" style={{ opacity: isLoading ? 0.6 : 1, minHeight: 120 }}>
        {isLoading && (
          <Box sx={{ position:'absolute', inset:0, display:'flex', justifyContent:'center', alignItems:'center', backgroundColor:'rgba(255,255,255,0.5)', zIndex:10 }}>
            <CircularProgress sx={{ color: '#6c35de' }} />
          </Box>
        )}
        {!isLoading && courses.length === 0 && (
          <p className="text-sm text-slate-400 col-span-3 py-8 text-center">Arxivlangan kurslar yo'q</p>
        )}
        {courses.map((course, i) => (
          <div key={course.id} className="rounded-2xl p-5 border border-slate-100 shadow-sm opacity-70"
            style={{ backgroundColor: course.color || CARD_COLORS[i % CARD_COLORS.length] }}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">{course.name}</h3>
              <button
                onClick={() => setRestoreConfirm({ isOpen: true, courseId: course.id })}
                className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-white/60 rounded-lg transition-colors"
                title="Tiklash"
              >
                <RestoreOutlinedIcon fontSize="small" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">{course.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-white/70 text-slate-700 rounded-lg text-xs font-medium">{course.duration_hours} min</span>
              <span className="px-2.5 py-1 bg-white/70 text-slate-700 rounded-lg text-xs font-medium">{course.duration_month} oy</span>
              <span className="px-2.5 py-1 bg-white/70 text-slate-700 rounded-lg text-xs font-medium">{course.price} so'm</span>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={restoreConfirm.isOpen}
        onClose={() => setRestoreConfirm({ isOpen: false, courseId: null })}
        onConfirm={() => { const id = restoreConfirm.courseId; setRestoreConfirm({ isOpen: false, courseId: null }); actualRestoreCourse(id); }}
        title="Kursni tiklash"
        message="Ushbu kursni arxivdan tiklashni xohlaysizmi?"
      />
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, courseId: null })}
        onConfirm={() => { const id = deleteConfirm.courseId; setDeleteConfirm({ isOpen: false, courseId: null }); actualDeleteCourseForever(id); }}
        title="Kursni butunlay o'chirish"
        message="Bu amalni ortga qaytarib bo'lmaydi!"
      />
    </div>
  );
}
