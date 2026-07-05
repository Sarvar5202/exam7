import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api/api";
import { toast } from "../../../components/UI/Toast/Toast";
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import Switch from '@mui/material/Switch';

const inputCls = "w-full h-10 px-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6c35de] focus:ring-2 focus:ring-[#6c35de]/20 outline-none transition-all";

const monthToNumber = (monthStr) => {
  if (!monthStr) return null;
  const lower = monthStr.toLowerCase().trim();
  const months = {
    jan: 1, january: 1, yan: 1, yanvar: 1,
    feb: 2, february: 2, fev: 2, fevral: 2,
    mar: 3, march: 3, mart: 3,
    apr: 4, april: 4, aprel: 4,
    may: 5,
    jun: 6, june: 6, iyun: 6,
    jul: 7, july: 7, iyul: 7,
    aug: 8, august: 8, avg: 8, avgust: 8,
    sep: 9, september: 9, sen: 9, sentabr: 9, sentyabr: 9,
    oct: 10, october: 10, okt: 10, oktabr: 10, oktyabr: 10,
    nov: 11, november: 11, noy: 11, noyabr: 11,
    dec: 12, december: 12, dek: 12, dekabr: 12
  };
  for (const key in months) {
    if (lower.startsWith(key)) {
      return months[key];
    }
  }
  return null;
};

const getYearFromStartDate = (startDate) => {
  if (!startDate) return new Date().getFullYear();
  const parts = startDate.split("-");
  if (parts.length > 0) {
    const yr = parseInt(parts[0], 10);
    if (!isNaN(yr)) return yr;
  }
  return new Date().getFullYear();
};

const getFormattedDateStr = (day, monthStr, startDate) => {
  const year = getYearFromStartDate(startDate);
  const monthNum = monthToNumber(monthStr);
  if (!monthNum) {
    if (startDate) {
      const parts = startDate.split("-");
      if (parts.length > 1) return `${parts[0]}-${parts[1]}-${String(day).padStart(2, '0')}`;
    }
    const currentMonthNum = new Date().getMonth() + 1;
    return `${year}-${String(currentMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const isFutureDate = (dateStr) => {
  if (!dateStr) return false;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return false;
  const today = new Date();
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return targetDate > todayDate;
};

export default function LessonDetail() {
  const { id, date } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Teacher");
  const [topicType, setTopicType] = useState("Boshqa");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [students, setStudents] = useState([]);
  const [curriculumLessons, setCurriculumLessons] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [groupDetails, setGroupDetails] = useState(null);

  useEffect(() => {
    if (id && topicType === "O'quv reja bo'yicha" && curriculumLessons.length === 0) {
      api.get(`/lessons/my/group/${id}`).then(res => setCurriculumLessons(res.data?.data || [])).catch(() => {});
    }
  }, [id, topicType, curriculumLessons.length]);

  useEffect(() => {
    if (id && date) {
      setTopic("");
      setDescription("");
      setStudents([]);
      api.get(`/groups/${id}/lesson?date=${date}`).then(res => {
        const main = res.data?.data || res.data || {};
        const lesson = main.lesson || null;
        const attendance = main.attendance || main.attendances || [];
        setTopic(lesson?.topic || main.topic || "");
        setDescription(lesson?.description || main.description || "");
        if (attendance && attendance.length > 0) {
          setStudents(attendance.map(s => ({ id: s.student_id, name: s.full_name || "Noma'lum", photo: s.photo, present: String(s.isPresent).toLowerCase() === "true" || s.isPresent === 1 })));
        } else if (groupDetails && groupDetails.students) {
          setStudents(groupDetails.students.map(s => ({ id: s.id, name: s.full_name || s.name || "Noma'lum", photo: s.photo, present: true })));
        }
      }).catch(() => {});
    }
  }, [id, date, groupDetails]);

  useEffect(() => {
    if (id) {
      api.get(`/groups/${id}`).then(res => setGroupDetails(res.data?.data || res.data || {})).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (groupDetails && students.length === 0) {
      const gStudents = groupDetails.students || [];
      setStudents(gStudents.map(s => ({
        id: s.id,
        name: s.full_name || s.name || "Noma'lum",
        photo: s.photo,
        present: true
      })));
    }
  }, [groupDetails, students.length]);

  useEffect(() => {
    if (id) {
      api.get(`/groups/${id}/schedules`).then(res => {
        const formatted = [];
        (res.data || []).forEach(item => {
          Object.keys(item).sort((a,b) => Number(a)-Number(b)).forEach(key => {
            const v = item[key];
            formatted.push({ id: key, label: `${key}-o'quv oyi`, isCurrent: v.isActive, days: v.days.map((d, di) => ({ id: `${key}-${di}`, day: d.day, month: d.month, isCompleted: d.isCompleted })) });
          });
        });
        setSchedules(formatted);
      }).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (schedules.length > 0 && date) {
      const parts = date.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const monthNum = parseInt(parts[1], 10);
        const dayNum = parseInt(parts[2], 10);
        const foundIdx = schedules.findIndex(m => {
          return m.days.some(d => {
            const mNum = monthToNumber(d.month);
            return d.day === dayNum && mNum === monthNum;
          });
        });
        if (foundIdx !== -1) {
          setCurrentMonth(foundIdx);
        }
      }
    }
  }, [schedules, date]);

  useEffect(() => {
    if (date && isFutureDate(date)) {
      navigate(`/dashboard/groups/${id}`);
    }
  }, [date, id, navigate]);

  const handleSave = async () => {
    if (!topic.trim()) {
      toast.error("Mavzuni kiriting!");
      return;
    }
    setIsSaving(true);
    try {
      // Dars + davomat birgalikda saqlash
      // Backend haqiqiy schemasi: group_id, topic, description, lesson_date (ISO 8601), attendances (student_id[])
      const presentStudentIds = students
        .filter(s => s.present)
        .map(s => ({ student_id: Number(s.id) }));

      await api.post(`/groups/${id}/lesson`, {
        group_id: Number(id),
        topic,
        description,
        lesson_date: date,
        attendances: presentStudentIds
      });

      toast.success("Dars muvaffaqiyatli saqlandi!");
    } catch (err) {
      toast.error("Saqlashda xatolik yuz berdi!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pt-6 flex flex-col gap-5 flex-1 min-h-0 overflow-auto pb-6">
      {/* Date navigator */}
      {schedules.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setCurrentMonth(p => Math.max(0, p-1))} disabled={currentMonth === 0} className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"><KeyboardArrowLeftRoundedIcon fontSize="small" /></button>
            <span className="text-sm font-semibold text-slate-800">{schedules[currentMonth]?.label || ""}</span>
            <button onClick={() => setCurrentMonth(p => Math.min(schedules.length - 1, p+1))} disabled={currentMonth >= schedules.length - 1 || schedules.length === 0} className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"><KeyboardArrowRightRoundedIcon fontSize="small" /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(schedules[currentMonth]?.days || []).map((d, i) => {
              const dateStr = getFormattedDateStr(d.day, d.month, groupDetails?.start_date);
              const isFuture = isFutureDate(dateStr);
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
      )}

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
        <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-[#6c35de] text-white text-sm font-semibold rounded-xl hover:bg-[#5a2cc0] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">{isSaving ? "Saqlanmoqda..." : "Saqlash"}</button>
      </div>
    </div>
  );
}
