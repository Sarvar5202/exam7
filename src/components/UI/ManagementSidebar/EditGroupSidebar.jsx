import { useEffect, useState } from "react";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { createPortal } from "react-dom";
import AddStudentModal from "../GroupModal/AddStudentModal/AddStudentModal";
import AddTeacherModal from "../GroupModal/AddTeacherModal/AddTeacherModal";
import { api } from "../../../api/api";

const DAYS = [
  { id: 'mon', label: 'Dushanba' }, { id: 'tue', label: 'Seshanba' },
  { id: 'wed', label: 'Chorshanba' }, { id: 'thu', label: 'Payshanba' },
  { id: 'fri', label: 'Juma' }, { id: 'sat', label: 'Shanba' },
  { id: 'sun', label: 'Yakshanba' },
];
const DAY_REV = { MONDAY:'mon', TUESDAY:'tue', WEDNESDAY:'wed', THURSDAY:'thu', FRIDAY:'fri', SATURDAY:'sat', SUNDAY:'sun' };
const DAY_FWD = { mon:'MONDAY', tue:'TUESDAY', wed:'WEDNESDAY', thu:'THURSDAY', fri:'FRIDAY', sat:'SATURDAY', sun:'SUNDAY' };

const inputCls = "w-full h-10 px-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6c35de] focus:ring-2 focus:ring-[#6c35de]/20 outline-none transition-all";
const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

export default function EditGroupSidebar({ isOpen, onClose, groupData, onSave }) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [teachersOptions, setTeachersOptions] = useState([]);
  const [studentsOptions, setStudentsOptions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [form, setForm] = useState({ name: "", description: "", courseId: "", roomId: "", startDate: "", startTime: "09:00", maxStudent: 15, weekDays: [], teachers: [], students: [] });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleDayToggle = (id) => setForm(prev => ({ ...prev, weekDays: prev.weekDays.includes(id) ? prev.weekDays.filter(d => d !== id) : [...prev.weekDays, id] }));

  const formatDateForInput = (v) => {
    if (!v) return "";
    const iso = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return iso[0];
    const dmy = v.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`;
    const d = new Date(v);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  const toggleTeacherModal = () => {
    if (!isAddTeacherOpen && (teachersOptions.length === 0 || teachersOptions.length === (groupData?.teachers?.length || 0))) {
      api.get('/teachers').then(r => { setTeachersOptions(r.data?.data || []); setIsAddTeacherOpen(true); }).catch(() => setIsAddTeacherOpen(true));
    } else setIsAddTeacherOpen(prev => !prev);
  };
  const toggleStudentModal = () => {
    if (!isAddStudentOpen && (studentsOptions.length === 0 || studentsOptions.length === (groupData?.students?.length || 0))) {
      api.get('/students').then(r => { setStudentsOptions(r.data?.data || []); setIsAddStudentOpen(true); }).catch(() => setIsAddStudentOpen(true));
    } else setIsAddStudentOpen(prev => !prev);
  };

  useEffect(() => {
    if (isOpen) {
      api.get('/courses').then(r => setCourses(r.data?.data || [])).catch(console.error);
      api.get('/rooms').then(r => setRooms(r.data?.data || [])).catch(console.error);
      if (groupData?.teachers?.length > 0 && typeof groupData.teachers[0] === 'object') {
        setTeachersOptions(prev => { const ex = groupData.teachers.map(t => ({ id: t.id, full_name: t.full_name || t.name })); const n = ex.filter(e => !prev.find(p => p.id === e.id)); return [...prev, ...n]; });
      }
      if (groupData?.students?.length > 0 && typeof groupData.students[0] === 'object') {
        setStudentsOptions(prev => { const ex = groupData.students.map(s => ({ id: s.id, full_name: s.full_name || s.name })); const n = ex.filter(e => !prev.find(p => p.id === e.id)); return [...prev, ...n]; });
      }
    }
  }, [isOpen, groupData]);

  useEffect(() => {
    if (groupData && (courses.length > 0 || rooms.length > 0)) {
      let cId = "";
      if (groupData.course) { if (typeof groupData.course === 'object') { cId = groupData.course.id || groupData.course_id || ""; } else { const m = courses.find(c => c.name === groupData.course || String(c.id) === String(groupData.course)); cId = m ? m.id : ""; } }
      if (!cId && groupData.course_id) cId = groupData.course_id;

      let rId = "";
      if (groupData.room) { if (typeof groupData.room === 'object') { rId = groupData.room.id || groupData.room_id || ""; } else { const m = rooms.find(r => r.name === groupData.room || String(r.id) === String(groupData.room)); rId = m ? m.id : ""; } }
      if (!rId && groupData.room_id) rId = groupData.room_id;

      setForm({
        name: groupData.name || "",
        description: groupData.description || "",
        courseId: cId || "",
        roomId: rId || "",
        startDate: formatDateForInput(groupData.start_date),
        startTime: groupData.start_time?.slice(0, 5) || "09:00",
        maxStudent: groupData.max_student || 15,
        weekDays: (groupData.week_day || []).map(d => DAY_REV[d.toUpperCase()] || d.toLowerCase()),
        teachers: (groupData.teachers || []).map(t => typeof t === 'object' ? t.id : Number(t)),
        students: (groupData.students || []).map(s => typeof s === 'object' ? s.id : Number(s)),
      });
    }
  }, [groupData, courses, rooms]);

  useEffect(() => {
    if (isOpen) { setShouldRender(true); document.body.style.overflow = 'hidden'; }
    else { const t = setTimeout(() => { setShouldRender(false); document.body.style.overflow = 'unset'; }, 300); return () => clearTimeout(t); }
  }, [isOpen]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const { name, courseId, roomId, startDate, startTime, maxStudent, weekDays, teachers, students } = form;
    if (!name || !courseId || !roomId || !startDate || !startTime || !maxStudent || weekDays.length === 0) { alert("Iltimos, barcha majburiy maydonlarni to'ldiring!"); return; }

    let formattedDate = startDate;
    const m = startDate.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (m) formattedDate = `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;

    const payload = { name, description: form.description, course_id: Number(courseId), room_id: Number(roomId), start_date: formattedDate, start_time: startTime, max_student: Number(maxStudent), week_day: weekDays.map(d => DAY_FWD[d] || d), teachers: teachers.map(Number), students: students.map(Number) };

    api.patch(`/groups/${groupData.id}`, payload).then(() => {
      if (onSave) {
        const selCourse = courses.find(c => String(c.id) === String(courseId));
        const selRoom = rooms.find(r => String(r.id) === String(roomId));
        const selTeachers = form.teachers.map(id => teachersOptions.find(t => String(t.id) === String(id))).filter(Boolean);
        const selStudents = form.students.map(id => studentsOptions.find(s => String(s.id) === String(id))).filter(Boolean);
        onSave({ name, course: selCourse || groupData.course, start_time: startTime, week_day: weekDays.map(d => DAY_FWD[d] || d), room: selRoom ? selRoom.name : groupData.room, teachers: selTeachers, students: selStudents });
      }
      onClose();
    }).catch(err => {
      const d = err.response?.data;
      let msg = err.message;
      if (d?.errors) msg = Object.entries(d.errors).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
      else if (Array.isArray(d?.message)) msg = d.message.join(', ');
      else if (d?.message) msg = d.message;
      alert("Xatolik: " + msg);
    });
  };

  if (!shouldRender) return null;

  return createPortal(
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-end z-[9999] transition-opacity duration-300 ${!isOpen ? 'opacity-0' : 'opacity-100'}`} onClick={onClose}>
      <form
        className={`bg-white h-full w-[560px] max-w-full flex flex-col shadow-2xl transition-transform duration-300 overflow-hidden ${!isOpen ? 'translate-x-full' : 'translate-x-0'}`}
        onSubmit={handleSubmit} onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Guruhni tahrirlash</h2>
            <p className="text-sm text-slate-500 mt-0.5">Guruh ma'lumotlarini o'zgartiring.</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg"><CloseRoundedIcon fontSize="small" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <div><label className={labelCls}>Guruh nomi <span className="text-red-500">*</span></label><input type="text" name="name" placeholder="Frontend 2024" value={form.name} onChange={handleChange} className={inputCls} /></div>
          <div>
            <label className={labelCls}>Kurs <span className="text-red-500">*</span></label>
            <select name="courseId" value={form.courseId} onChange={handleChange} className={inputCls + " bg-white"}>
              <option value="" disabled>Tanlang</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {form.courseId && <p className="text-xs text-[#6c35de] font-medium mt-1">Kurs davomiyligi: {courses.find(c => String(c.id) === String(form.courseId))?.duration_month || 0} oy</p>}
          </div>
          <div>
            <label className={labelCls}>Xona <span className="text-red-500">*</span></label>
            <select name="roomId" value={form.roomId} onChange={handleChange} className={inputCls + " bg-white"}>
              <option value="" disabled>Tanlang</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Dars kunlari <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-4 gap-2">
              {DAYS.map(day => (
                <label key={day.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-all ${form.weekDays.includes(day.id) ? 'border-[#6c35de] bg-[#6c35de]/10 text-[#6c35de] font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={form.weekDays.includes(day.id)} onChange={() => handleDayToggle(day.id)} className="w-3.5 h-3.5 accent-[#6c35de]" />
                  <span>{day.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Dars vaqti <span className="text-red-500">*</span></label><input type="time" name="startTime" value={form.startTime} onChange={handleChange} className={inputCls} /></div>
            <div><label className={labelCls}>Boshlanish sanasi</label><input type="date" name="startDate" value={form.startDate} onChange={handleChange} className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Max talabalar</label><input type="number" name="maxStudent" value={form.maxStudent} onChange={handleChange} className={inputCls} /></div>
          <div><label className={labelCls}>Tavsif</label><textarea name="description" value={form.description} onChange={handleChange} className={inputCls + " h-20 py-2 resize-none"} /></div>
          <div>
            <label className={labelCls}>O'qituvchilar</label>
            <div className="flex flex-wrap gap-1.5 p-2.5 border border-slate-200 rounded-lg min-h-[40px]">
              {form.teachers.map(id => {
                const t = teachersOptions.find(x => String(x.id) === String(id));
                return <span key={id} className="flex items-center gap-1 px-2.5 py-1 bg-[#6c35de]/10 text-[#6c35de] rounded-md text-xs font-medium">{t ? t.full_name : `#${id}`}<button type="button" onClick={() => setForm(prev => ({ ...prev, teachers: prev.teachers.filter(x => x !== id) }))} className="text-[#6c35de] leading-none">×</button></span>;
              })}
              <button type="button" onClick={toggleTeacherModal} className="flex items-center gap-1 text-xs text-[#6c35de] font-medium hover:underline"><AddRoundedIcon style={{ fontSize: 14 }} /><span>Qo'shish</span></button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Talabalar</label>
            <div className="flex flex-wrap gap-1.5 p-2.5 border border-slate-200 rounded-lg min-h-[40px]">
              {form.students.map(id => {
                const s = studentsOptions.find(x => String(x.id) === String(id));
                return <span key={id} className="flex items-center gap-1 px-2.5 py-1 bg-[#6c35de]/10 text-[#6c35de] rounded-md text-xs font-medium">{s ? s.full_name : `#${id}`}<button type="button" onClick={() => setForm(prev => ({ ...prev, students: prev.students.filter(x => x !== id) }))} className="text-[#6c35de] leading-none">×</button></span>;
              })}
              <button type="button" onClick={toggleStudentModal} className="flex items-center gap-1 text-xs text-[#6c35de] font-medium hover:underline"><AddRoundedIcon style={{ fontSize: 14 }} /><span>Qo'shish</span></button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Bekor qilish</button>
          <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[#6c35de] rounded-lg hover:bg-[#5a2cc0] transition-colors">Saqlash</button>
        </div>

        <AddTeacherModal isOpen={isAddTeacherOpen} onClose={toggleTeacherModal} items={teachersOptions} initialSelected={form.teachers} onAdd={sel => { setForm(prev => ({ ...prev, teachers: sel })); toggleTeacherModal(); }} />
        <AddStudentModal isOpen={isAddStudentOpen} onClose={toggleStudentModal} items={studentsOptions} initialSelected={form.students} onAdd={sel => { setForm(prev => ({ ...prev, students: sel })); toggleStudentModal(); }} />
      </form>
    </div>,
    document.body
  );
}
