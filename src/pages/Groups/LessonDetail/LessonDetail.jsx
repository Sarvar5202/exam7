import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api/api";
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import Switch from '@mui/material/Switch';

const inputCls = "w-full h-10 px-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6c35de] focus:ring-2 focus:ring-[#6c35de]/20 outline-none transition-all";

const DATES = [2,5,7,9,12,14,16,19,21,23,26,28,30].map(d => ({ day: d, month: "May" }));

export default function LessonDetail() {
  const { id, date } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Teacher");
  const [topicType, setTopicType] = useState("Boshqa");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [students, setStudents] = useState([]);
  const [curriculumLessons, setCurriculumLessons] = useState([]);

  useEffect(() => {
    if (id && topicType === "O'quv reja bo'yicha" && curriculumLessons.length === 0) {
      api.get(`/lessons/my/group/${id}`).then(res => setCurriculumLessons(res.data?.data || [])).catch(() => {});
    }
  }, [id, topicType, curriculumLessons.length]);

  useEffect(() => {
    if (id && date) {
      api.get(`/groups/${id}/lesson?date=${date}`).then(res => {
        const main = res.data?.data || res.data || {};
        const lesson = main.lesson || null;
        const attendance = main.attendance || main.attendances || [];
        setTopic(lesson?.topic || main.topic || "");
        setDescription(lesson?.description || main.description || "");
        setStudents(attendance.map(s => ({ id: s.student_id, name: s.full_name || "Noma'lum", photo: s.photo, present: String(s.isPresent).toLowerCase() === "true" || s.isPresent === 1 })));
      }).catch(() => {});
    }
  }, [id, date]);

  const handleSave = async () => {
    if (!topic.trim()) { return; }
    try {
      await api.post(`/groups/${id}/lesson`, { group_id: Number(id), topic, lesson_date: date, description, attendances: students.filter(s => s.present).map(s => ({ student_id: s.id, isPresent: s.present })) });
    } catch {
      // silent — UI da xatolik ko'rsatilmaydi
    }
  };

  return (
    <div className="pt-6 flex flex-col gap-5 flex-1 min-h-0 overflow-auto pb-6">
      {/* Date navigator */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center gap-3 mb-4">
          <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"><KeyboardArrowLeftRoundedIcon fontSize="small" /></button>
          <span className="text-sm font-semibold text-slate-800">1-o'quv oyi</span>
          <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"><KeyboardArrowRightRoundedIcon fontSize="small" /></button>
        </div>
        <div className="flex flex-wrap gap-2">
          {DATES.map((d, i) => {
            const dateStr = `2026-05-${String(d.day).padStart(2,'0')}`;
            const isFuture = new Date(dateStr) > new Date();
            const isActive = date === dateStr;
            return (
              <div key={i} onClick={() => { if (!isFuture) navigate(`/dashboard/groups/${id}/lesson/${dateStr}`); }}
                className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-all ${isActive ? 'bg-[#6c35de] border-[#6c35de] text-white' : isFuture ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-800 cursor-pointer hover:border-[#6c35de]'}`}>
                <span className="text-xs">{d.month}</span>
                <span className="text-sm font-bold">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {["Assistant","Teacher"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === t ? 'bg-[#6c35de] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{t}</button>
        ))}
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Ma'lumot</h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6c35de] text-white flex items-center justify-center font-bold">M</div>
            <div><p className="text-sm font-semibold text-slate-800">Mohirbek</p><p className="text-xs text-slate-500">Teacher</p></div>
          </div>
          <div><p className="text-xs text-slate-400">Dars kuni</p><p className="text-sm font-medium text-slate-800">{date}</p></div>
          <div><p className="text-xs text-slate-400">Holat</p><span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Dars o'tilmagan</span></div>
        </div>
      </div>

      {/* Yo'qlama */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Yo'qlama va mavzu kiritish</h3>
        <div className="flex items-center gap-4 mb-4">
          {["O'quv reja bo'yicha","Boshqa"].map(v => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="topicType" value={v} checked={topicType === v} onChange={e => setTopicType(e.target.value)} className="accent-[#6c35de]" />
              <span className="text-sm text-slate-700">{v}</span>
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"><span className="text-red-500">*</span> Mavzu</label>
            {topicType === "O'quv reja bo'yicha" ? (
              <select value={topic} onChange={e => setTopic(e.target.value)} className={inputCls + " bg-white"}>
                <option value="" disabled>Mavzuni tanlang...</option>
                {curriculumLessons.map(l => <option key={l.id} value={l.topic}>{l.topic}</option>)}
              </select>
            ) : (
              <input type="text" placeholder="Mavzuni kiriting..." value={topic} onChange={e => setTopic(e.target.value)} className={inputCls} />
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tavsif</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Dars haqida..." className={inputCls + " h-24 py-2 resize-none"} />
          </div>
        </div>
      </div>

      {/* Students */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Talabalar ({students.length})</h3>
        </div>
        <div className="flex flex-col">
          {students.map(s => (
            <div key={s.id} className="flex items-center justify-between px-5 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                {s.photo ? (
                  <img src={s.photo.startsWith('http') ? s.photo : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/${s.photo}`} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#6c35de] text-white flex items-center justify-center text-sm font-semibold">{s.name.charAt(0)}</div>
                )}
                <span className="text-sm font-medium text-slate-800">{s.name}</span>
              </div>
              <Switch checked={s.present} onChange={() => setStudents(prev => prev.map(x => x.id === s.id ? { ...x, present: !x.present } : x))} size="small" sx={{ '& .MuiSwitch-thumb': { width: 18, height: 18 }, '& .MuiSwitch-switchBase.Mui-checked': { color: '#6c35de' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6c35de' } }} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="px-6 py-2.5 bg-[#6c35de] text-white text-sm font-semibold rounded-xl hover:bg-[#5a2cc0] transition-colors">Saqlash</button>
      </div>
    </div>
  );
}
