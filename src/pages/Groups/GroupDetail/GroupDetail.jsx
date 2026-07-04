import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { api } from "../../../api/api";
import { toast } from "../../../components/UI/Toast/Toast";
import { useApp } from "../../../context/AppContext";
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import UygaVazifa from './UygaVazifa';
import Videolar from './Videolar';

const DAY_UZ = { MONDAY:"Du", TUESDAY:"Se", WEDNESDAY:"Ch", THURSDAY:"Pa", FRIDAY:"Ju", SATURDAY:"Sha", SUNDAY:"Yak" };
const DAY_RU = { MONDAY:"Пн", TUESDAY:"Вт", WEDNESDAY:"Ср", THURSDAY:"Чт", FRIDAY:"Пт", SATURDAY:"Сб", SUNDAY:"Вс" };

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

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useApp();

  const [currentMonth, setCurrentMonth] = useState(0);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [groupDetails, setGroupDetails] = useState(location.state?.groupData || null);
  const [videoRefresh, setVideoRefresh] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [videoFileName, setVideoFileName] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [groupLessons, setGroupLessons] = useState([]);
  const [showAllSchedules, setShowAllSchedules] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const fileInputRef = useRef(null);
  const schedulesFetchedRef = useRef(false);
  const groupDetailsFetchedRef = useRef(false);
  const lessonsFetchedRef = useRef(false);
  const detailedFetchedRef = useRef(false);

  const TABS_LABELS = [t.groupInfo, t.groupLessons, t.academicAttendance];
  const SUBTABS = [t.homework, t.videos, t.exams, t.journal];

  const tabIndex = searchParams.get("tab") || "0";
  const activeTab = TABS_LABELS[Number(tabIndex)] || TABS_LABELS[0];
  const activeSubTab = searchParams.get("subtab") || SUBTABS[0];
  const handleTabChange = (i) => setSearchParams({ tab: i });
  const setActiveSubTab = (s) => { const p = new URLSearchParams(searchParams); p.set("subtab", s); setSearchParams(p); };

  const formatDate = (s) => {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "";
    const M = ["Yan","Fev","Mar","Apr","May","Iyun","Iyul","Avg","Sen","Okt","Noy","Dek"];
    return `${String(d.getDate()).padStart(2,'0')} ${M[d.getMonth()]}, ${d.getFullYear()}`;
  };
  const calculateEndTime = (time, h = 2) => {
    if (!time) return "";
    const [hh, mm] = time.split(":").map(Number);
    const d = new Date(); d.setHours(hh + h, mm);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };
  const calculateEndDate = (s, months) => {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "";
    d.setMonth(d.getMonth() + (parseInt(months, 10) || 0));
    return d.toISOString();
  };
  const translateDays = (days) => {
    const map = lang === 'ru' ? DAY_RU : DAY_UZ;
    return !days || !Array.isArray(days) ? "" : days.map(d => map[d] || d).join("/");
  };

  const handleModalClose = () => { setIsVideoModalOpen(false); setSelectedVideoFile(null); setVideoFileName(""); setSelectedLessonId(""); };
  const handleFileSelect = (e) => { const f = e.target.files[0]; if (f) { setSelectedVideoFile(f); setVideoFileName(f.name); } };

  const handleVideoUpload = async () => {
    if (!selectedVideoFile || !selectedLessonId) return;
    setIsUploadingVideo(true);
    try {
      const fileName = videoFileName.trim() || selectedVideoFile.name;
      const uploadFile = new File([selectedVideoFile], fileName, {
        type: selectedVideoFile.type,
        lastModified: selectedVideoFile.lastModified,
      });
      const fd = new FormData(); fd.append("file", uploadFile);
      await api.post(`/files/group/${id}/upload?lessonId=${selectedLessonId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setVideoRefresh(p => p + 1); handleModalClose();
    } catch { /* silent */ }
    finally { setIsUploadingVideo(false); }
  };

  const handleAddStudents = async () => {
    if (selectedStudentIds.length === 0) return;
    setIsAddingStudent(true);
    try {
      await Promise.all(selectedStudentIds.map(student_id => api.post('/student-group', { student_id: Number(student_id), group_id: Number(id) })));
      detailedFetchedRef.current = false;
      groupDetailsFetchedRef.current = false;
      setIsAddStudentModalOpen(false);
      setSelectedStudentIds([]);
      api.get(`/groups/${id}`).then(res => setGroupDetails(p => ({ ...p, ...(res.data?.data || res.data || {}) })));
      api.get(`/groups/one/${id}`).then(res => setGroupDetails(p => ({ ...p, ...(res.data?.data || res.data || {}) })));
      toast.success(`${selectedStudentIds.length} ${t.studentAddSuccess}`);
    } catch {
      toast.error(t.studentAddError);
    } finally {
      setIsAddingStudent(false);
    }
  };

  useEffect(() => {
    if (id && tabIndex === "0" && !schedulesFetchedRef.current) {
      schedulesFetchedRef.current = true;
      api.get(`/groups/${id}/schedules`).then(res => {
        const formatted = [];
        (res.data || []).forEach(item => {
          Object.keys(item).sort((a,b) => Number(a)-Number(b)).forEach(key => {
            const v = item[key];
            formatted.push({ id: key, label: `${key}-${lang === 'ru' ? 'уч. месяц' : "o'quv oyi"}`, isCurrent: v.isActive, days: v.days.map((d, di) => ({ id: `${key}-${di}`, day: d.day, month: d.month, isCompleted: d.isCompleted })) });
          });
        });
        setSchedules(formatted);
        const activeIdx = formatted.findIndex(m => m.isCurrent);
        if (activeIdx !== -1) {
          setCurrentMonth(activeIdx);
        }
      }).catch(() => { schedulesFetchedRef.current = false; });
    }
  }, [id, tabIndex, lang]);

  useEffect(() => {
    if (id && tabIndex === "0" && !groupDetailsFetchedRef.current) {
      if (location.state?.groupData) { groupDetailsFetchedRef.current = true; return; }
      groupDetailsFetchedRef.current = true;
      api.get(`/groups/${id}`).then(res => setGroupDetails(p => ({ ...p, ...(res.data?.data || res.data || {}) }))).catch(() => { groupDetailsFetchedRef.current = false; });
    }
  }, [id, tabIndex, location.state]);

  useEffect(() => {
    if (id && tabIndex === "0" && !detailedFetchedRef.current) {
      detailedFetchedRef.current = true;
      api.get(`/groups/one/${id}`).then(res => setGroupDetails(p => ({ ...p, ...(res.data?.data || res.data || {}) }))).catch(() => { detailedFetchedRef.current = false; });
    }
  }, [id, tabIndex]);

  useEffect(() => {
    if (id && isVideoModalOpen && !lessonsFetchedRef.current) {
      lessonsFetchedRef.current = true;
      api.get(`/lessons/my/group/${id}`).then(res => { const d = res.data.data || res.data || []; setGroupLessons(Array.isArray(d) ? d : [d]); }).catch(() => { lessonsFetchedRef.current = false; });
    }
  }, [id, isVideoModalOpen]);



  return (
    <div className="pt-6 flex flex-col gap-5 flex-1 min-h-0 overflow-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard/groups")} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <ArrowBackIosNewRoundedIcon fontSize="small" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{groupDetails?.name || ""}</h1>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{groupDetails?.status || t.active}</span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <AssessmentOutlinedIcon fontSize="small" />{t.statistics}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-0 overflow-x-auto">
        {TABS_LABELS.map((tab, i) => (
          <button key={tab} onClick={() => handleTabChange(String(i))} className={`flex-shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${activeTab === tab ? 'border-[#6c35de] text-[#6c35de]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{tab}</button>
        ))}
      </div>

      {/* Tab 0: Ma'lumotlar */}
      {activeTab === TABS_LABELS[0] && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">{t.mentors}</h3>
              </div>
              <div className="flex flex-wrap gap-4">
                {groupDetails?.teachers?.map((teacher, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <img src={teacher.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.full_name || 'T')}&background=f8fafc&color=6c35de&size=128`} alt={teacher.full_name} className="w-14 h-14 rounded-full object-cover" />
                    <span className="text-xs text-[#6c35de] font-medium">{t.teacher2}</span>
                    <span className="text-xs font-semibold text-slate-800 text-center">{teacher.full_name || teacher.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Talabalar kartasi */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">{t.students2}</h3>
                <button onClick={() => { if (allStudents.length === 0) { api.get('/students').then(res => { setAllStudents(res.data?.data || []); setIsAddStudentModalOpen(true); }).catch(() => setIsAddStudentModalOpen(true)); } else { setIsAddStudentModalOpen(true); } }} className="flex items-center gap-1 text-xs text-[#6c35de] font-semibold hover:underline">
                  + {t.add}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(groupDetails?.students || []).slice(0, 8).map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-[#6c35de] text-white flex items-center justify-center text-xs font-semibold">{s.full_name?.charAt(0).toUpperCase() || 'T'}</div>
                    <span className="text-xs text-slate-600 text-center max-w-[60px] truncate">{s.full_name || s.name}</span>
                  </div>
                ))}
                {(groupDetails?.students?.length || 0) > 8 && (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">+{groupDetails.students.length - 8}</div>
                  </div>
                )}
              </div>
              {(groupDetails?.students?.length || 0) === 0 && <p className="text-sm text-slate-400 text-center py-4">{t.noStudentsAdded}</p>}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">{t.groupParams}</h3>
              <div className="flex flex-col gap-3">
                {[
                  [t.direction, groupDetails?.course?.name || ""],
                  [t.avgAge, `${groupDetails?.averageAge ?? 0} ${lang === 'ru' ? 'лет' : 'yosh'}`],
                  [t.capacity, `${groupDetails?.room_capacity ?? 0} ${lang === 'ru' ? 'чел.' : 'ta'}`],
                  [t.currentStudents, `${groupDetails?.student_count ?? 0} ${lang === 'ru' ? 'чел.' : 'ta'}`],
                  [t.courseDuration, `${groupDetails?.course?.duration_month ?? 0} ${t.month}`],
                  [t.totalLessons, `${schedules.reduce((s,m) => s + m.days.length, 0)} ${lang === 'ru' ? 'шт.' : 'ta'}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-sm text-slate-500">{k}</span>
                    <strong className="text-sm text-slate-900">{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-base font-bold text-slate-900 mb-4">{t.lessonSchedule}</h2>
            <div className="flex flex-col gap-3 mb-4">
              {(showAllSchedules ? groupDetails?.teachers || [] : (groupDetails?.teachers || []).slice(0, 2)).map((teacher, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-800">{teacher.full_name || teacher.name}</span>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{translateDays(groupDetails?.week_day)}</span>
                    <span>{groupDetails?.start_time} - {calculateEndTime(groupDetails?.start_time, 2)}</span>
                    <span>{formatDate(groupDetails?.start_date)} - {formatDate(calculateEndDate(groupDetails?.start_date, groupDetails?.course?.duration_month))}</span>
                    <span>{groupDetails?.room}</span>
                  </div>
                </div>
              ))}
              {(groupDetails?.teachers?.length || 0) > 2 && (
                <button onClick={() => setShowAllSchedules(p => !p)} className="text-sm text-[#6c35de] font-medium hover:underline self-start">
                  {showAllSchedules ? t.hide : `${t.showMore} (${groupDetails.teachers.length - 2})`}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setCurrentMonth(p => Math.max(0, p-1))} disabled={currentMonth === 0} className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"><KeyboardArrowLeftRoundedIcon fontSize="small" /></button>
              <span className="text-sm font-semibold text-slate-800">{schedules[currentMonth]?.label || ""}</span>
              <button onClick={() => setCurrentMonth(p => Math.min(schedules.length - 1, p+1))} disabled={currentMonth >= schedules.length - 1 || schedules.length === 0} className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"><KeyboardArrowRightRoundedIcon fontSize="small" /></button>
            </div>

            {(showAllMonths ? schedules : schedules.slice(currentMonth, currentMonth+1)).map((sm, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-slate-700">{sm.label}</span>
                  {sm.isCurrent && <span className="px-2 py-0.5 bg-[#6c35de]/10 text-[#6c35de] rounded-full text-xs font-medium">{t.currentMonth}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sm.days.map(d => {
                    const dateStr = getFormattedDateStr(d.day, d.month, groupDetails?.start_date);
                    const isFuture = isFutureDate(dateStr);
                    return (
                      <div key={d.id} 
                        onClick={() => { if (!isFuture) navigate(`/dashboard/groups/${id}/lesson/${dateStr}`); }}
                        className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-all ${isFuture ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' : 'cursor-pointer hover:border-[#6c35de] hover:bg-[#6c35de]/5'} ${d.isCompleted ? 'bg-slate-100 border-slate-200' : isFuture ? '' : 'bg-white border-slate-200'}`}>
                        <span className="text-xs text-slate-400">{d.month}</span>
                        <span className={`text-sm font-bold ${isFuture ? 'text-slate-300' : 'text-slate-800'}`}>{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {schedules.length > 1 && (
              <button onClick={() => setShowAllMonths(p => !p)} className="text-sm text-[#6c35de] font-medium hover:underline">
                {showAllMonths ? t.hide : t.showAll}
              </button>
            )}
          </div>
        </>
      )}

      {/* Tab 1: Guruh darsliklari */}
      {activeTab === TABS_LABELS[1] && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-900">{t.groupLessons}</h2>
              <div className="flex gap-1 overflow-x-auto">
                {SUBTABS.map(tab => (
                  <button key={tab} onClick={() => setActiveSubTab(tab)} className={`flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${activeSubTab === tab ? 'bg-[#6c35de] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{tab}</button>
                ))}
              </div>
            </div>
            <button onClick={() => { if (activeSubTab === t.videos) setIsVideoModalOpen(true); else navigate(`/dashboard/groups/${id}/homework/create`); }} className="px-4 py-2 bg-[#6c35de] text-white text-sm font-semibold rounded-lg hover:bg-[#5a2cc0] transition-colors">{t.add}</button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-auto">
            {activeSubTab === t.homework && <UygaVazifa />}
            {activeSubTab === t.videos && <Videolar refreshTrigger={videoRefresh} />}
          </div>
        </div>
      )}

      {/* Tab 2: Akademik davomati */}
      {activeTab === TABS_LABELS[2] && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setCurrentMonth(p => Math.max(0, p-1))} disabled={currentMonth === 0} className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"><KeyboardArrowLeftRoundedIcon fontSize="small" /></button>
            <span className="text-sm font-semibold text-slate-800">{schedules[currentMonth]?.label || ""}</span>
            <button onClick={() => setCurrentMonth(p => Math.min(schedules.length - 1, p+1))} disabled={currentMonth >= schedules.length - 1 || schedules.length === 0} className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"><KeyboardArrowRightRoundedIcon fontSize="small" /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(schedules[currentMonth]?.days || []).map((item, i) => {
              const dateStr = getFormattedDateStr(item.day, item.month, groupDetails?.start_date);
              const isFuture = isFutureDate(dateStr);
              return (
                <div key={i} onClick={() => { if (!isFuture) navigate(`/dashboard/groups/${id}/lesson/${dateStr}`); }}
                  className={`flex flex-col items-center px-4 py-3 rounded-xl border transition-all ${isFuture ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' : 'bg-[#6c35de]/10 border-[#6c35de]/20 cursor-pointer hover:bg-[#6c35de]/20 text-[#6c35de]'}`}>
                  <span className="text-xs">{item.month}</span>
                  <span className="text-base font-bold">{item.day}</span>
                </div>
              );
            })}
          </div>
          {(schedules.length === 0) && <p className="text-sm text-slate-400 text-center py-4">{t.noData || "Jadval yuklanmagan"}</p>}
        </div>
      )}

      {/* Video Upload Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={handleModalClose}>
          <div className="bg-white rounded-2xl w-[640px] max-w-[95vw] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">{t.addVideo}</h2>
              <button onClick={handleModalClose} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg"><CloseRoundedIcon fontSize="small" /></button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#6c35de] hover:bg-[#6c35de]/5 transition-all">
                <CloudUploadOutlinedIcon className="text-slate-400" style={{ fontSize: 40 }} />
                <p className="text-sm text-slate-600 text-center">{t.uploadVideo}</p>
                <p className="text-xs text-slate-400">{t.uploadFormats}</p>
              </div>
              {selectedVideoFile && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-slate-200"><th className="text-left py-2 text-slate-500 font-semibold text-xs">File name</th><th className="text-left py-2 text-slate-500 font-semibold text-xs">{t.lessonName}</th><th className="text-left py-2 text-slate-500 font-semibold text-xs">{t.videoName}</th><th></th></tr></thead>
                    <tbody>
                      <tr>
                        <td className="py-2 text-slate-700 pr-3">{selectedVideoFile.name}</td>
                        <td className="py-2 pr-3">
                          <select value={selectedLessonId} onChange={e => setSelectedLessonId(e.target.value)} className="h-9 px-2 border border-slate-200 rounded-lg text-sm bg-white w-36 focus:border-[#6c35de] outline-none">
                            <option value="" disabled>{t.selectLesson}</option>
                            {groupLessons.map(l => <option key={l.id} value={l.id}>{l.topic || l.title || l.name}</option>)}
                          </select>
                        </td>
                        <td className="py-2 pr-3"><input type="text" value={videoFileName} onChange={e => setVideoFileName(e.target.value)} className="h-9 px-2 border border-slate-200 rounded-lg text-sm w-full focus:border-[#6c35de] outline-none" /></td>
                        <td className="py-2"><button onClick={() => setSelectedVideoFile(null)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><DeleteOutlineRoundedIcon fontSize="small" /></button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".mp4,.webm,.mpeg,.avi,.mkv,.m4v,.ogm,.mov" onChange={handleFileSelect} />
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={handleModalClose} disabled={isUploadingVideo} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50">{t.cancel}</button>
              {selectedVideoFile && (
                <button onClick={handleVideoUpload} disabled={isUploadingVideo} className="px-4 py-2 text-sm font-semibold text-white bg-[#6c35de] rounded-lg hover:bg-[#5a2cc0] transition-colors disabled:opacity-50">
                  {isUploadingVideo ? t.uploading : t.uploadFiles}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Talaba qo'shish modali */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={() => setIsAddStudentModalOpen(false)}>
          <div className="bg-white rounded-2xl w-[540px] max-w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">{t.addStudentToGroup}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{t.addStudentToGroupSubtitle}</p>
              </div>
              <button onClick={() => setIsAddStudentModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg"><CloseRoundedIcon fontSize="small" /></button>
            </div>
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {allStudents.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">{t.noData}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {allStudents.map(student => {
                    const isInGroup = (groupDetails?.students || []).some(s => s.id === student.id);
                    const isSelected = selectedStudentIds.includes(student.id);
                    return (
                      <label key={student.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isInGroup ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' : isSelected ? 'bg-[#6c35de]/10 border-[#6c35de]' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                        <input type="checkbox" disabled={isInGroup} checked={isSelected} onChange={(e) => { if (e.target.checked) setSelectedStudentIds(prev => [...prev, student.id]); else setSelectedStudentIds(prev => prev.filter(sid => sid !== student.id)); }} className="w-4 h-4 accent-[#6c35de]" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">{student.full_name || student.name}</p>
                          <p className="text-xs text-slate-400">{student.phone}</p>
                        </div>
                        {isInGroup && <span className="text-xs text-slate-400 font-medium">{t.alreadyInGroup}</span>}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => { setIsAddStudentModalOpen(false); setSelectedStudentIds([]); }} disabled={isAddingStudent} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50">{t.cancel}</button>
              <button onClick={handleAddStudents} disabled={isAddingStudent || selectedStudentIds.length === 0} className="px-4 py-2 text-sm font-semibold text-white bg-[#6c35de] rounded-lg hover:bg-[#5a2cc0] transition-colors disabled:opacity-50">
                {isAddingStudent ? t.studentAdding : `${t.add} (${selectedStudentIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
