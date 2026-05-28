import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import CourseModal from "../../../components/UI/CourseModal/CourseModal";
import ConfirmDialog from "../../../components/UI/ConfirmDialog/ConfirmDialog";
import { api } from "../../../api/api";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const inputCls = "w-full h-10 px-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6c35de] focus:ring-2 focus:ring-[#6c35de]/20 outline-none transition-all";
const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

export default function Courses() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, courseId: null });
  const defaultData = { name: "", description: "", duration_hours: "", duration_month: "", price: "" };
  const [courseData, setCourseData] = useState(defaultData);

  const fetchCourses = () => {
    setIsLoading(true);
    api.get('/courses').then(res => setCourses(res.data.data)).catch(err => console.log(err.message)).finally(() => setIsLoading(false));
  };

  function dataSubmit(e) {
    e.preventDefault();
    const request = selectedCourse?.id ? api.patch(`/courses/${selectedCourse.id}`, courseData) : api.post('/courses', courseData);
    request.then(() => { fetchCourses(); closeModal(); }).catch(err => console.log(err.message));
  }

  const openAdd = () => { setSelectedCourse(null); setCourseData(defaultData); setIsModalOpen(true); };
  const openEdit = (c) => { setSelectedCourse(c); setCourseData({ name: c.name || "", description: c.description || "", duration_hours: c.duration_hours || "", duration_month: c.duration_month || "", price: c.price || "" }); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedCourse(null); setCourseData(defaultData); };

  useEffect(() => { fetchCourses(); }, []);

  const CARD_COLORS = ['#f0fdf4','#eff6ff','#fdf4ff','#fff7ed','#f0f9ff','#fefce8'];

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Kurslar</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/management/courses/archive')} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
            <ArchiveOutlinedIcon fontSize="small" />Arxiv
          </button>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#6c35de] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#5a2cc0] transition-colors">
            <AddRoundedIcon fontSize="small" />Kurslar qo'shish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 relative" style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.2s', minHeight: 150 }}>
        {isLoading && <Box sx={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 10 }}><CircularProgress sx={{ color: '#6c35de' }} /></Box>}
        {courses.map((course, i) => (
          <div key={course.id} className="rounded-2xl p-5 border border-slate-100 shadow-sm" style={{ backgroundColor: course.color || CARD_COLORS[i % CARD_COLORS.length] }}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">{course.name}</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => setDeleteConfirm({ isOpen: true, courseId: course.id })} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-white/60 rounded-lg transition-colors"><DeleteOutlineRoundedIcon fontSize="small" /></button>
                <button onClick={() => openEdit(course)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-[#6c35de] hover:bg-white/60 rounded-lg transition-colors"><EditOutlinedIcon fontSize="small" /></button>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">{course.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-white/70 text-slate-700 rounded-lg text-xs font-medium">{course.duration_hours} min</span>
              <span className="px-2.5 py-1 bg-white/70 text-slate-700 rounded-lg text-xs font-medium">{course.duration_month} oy</span>
              <span className="px-2.5 py-1 bg-white/70 text-slate-700 rounded-lg text-xs font-medium">{course.price} so'm</span>
            </div>
          </div>
        ))}
      </div>

      <CourseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedCourse ? "Kursni tahrirlash" : "Kurs qo'shish"}
        subtitle={selectedCourse ? "Kurs ma'lumotlarini yangilang." : "Bu yerda siz yangi kurs qo'shishingiz mumkin."}
        footer={
          <>
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Bekor qilish</button>
            <button type="submit" form="courseForm" className="px-4 py-2 text-sm font-semibold text-white bg-[#6c35de] rounded-lg hover:bg-[#5a2cc0] transition-colors">Saqlash</button>
          </>
        }
      >
        <form id="courseForm" onSubmit={dataSubmit} className="flex flex-col gap-4">
          <div><label className={labelCls}>Nomi</label><input name="name" value={courseData.name} onChange={e => setCourseData(p => ({ ...p, [e.target.name]: e.target.value }))} type="text" placeholder="HR Manager..." className={inputCls} /></div>
          <div>
            <label className={labelCls}>Dars davomiyligi</label>
            <select name="duration_hours" value={courseData.duration_hours} onChange={e => setCourseData(p => ({ ...p, [e.target.name]: e.target.value }))} className={inputCls + " bg-white"}>
              <option value="" disabled>Tanlang</option>
              <option value="60">60 min</option>
              <option value="120">120 min</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Kurs davomiyligi (oylarda)</label>
            <select name="duration_month" value={courseData.duration_month} onChange={e => setCourseData(p => ({ ...p, [e.target.name]: e.target.value }))} className={inputCls + " bg-white"}>
              <option value="" disabled>Tanlang</option>
              <option value="1">1 oy</option>
              <option value="3">3 oy</option>
              <option value="6">6 oy</option>
            </select>
          </div>
          <div><label className={labelCls}>Narx</label><input name="price" value={courseData.price} onChange={e => setCourseData(p => ({ ...p, [e.target.name]: e.target.value }))} type="text" placeholder="Narxini kiriting" className={inputCls} /></div>
          <div><label className={labelCls}>Tavsif</label><textarea name="description" value={courseData.description} onChange={e => setCourseData(p => ({ ...p, [e.target.name]: e.target.value }))} placeholder="Kurs haqida..." className={inputCls + " h-24 py-2 resize-none"} /></div>
        </form>
      </CourseModal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, courseId: null })}
        onConfirm={() => { const id = deleteConfirm.courseId; setDeleteConfirm({ isOpen: false, courseId: null }); if (id) api.delete(`/courses/${id}`).then(() => setCourses(prev => prev.filter(c => c.id !== id))).catch(err => console.log(err.message)); }}
        title="Kursni o'chirish"
        message="Rostdan ham o'chirishni hohlaysizmi?"
      />
    </div>
  );
}
