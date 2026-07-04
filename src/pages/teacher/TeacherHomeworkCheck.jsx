import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/api';
import Skeleton from '@mui/material/Skeleton';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

const FILE_BASE = 'https://najot-edu.softwareengineer.uz/api/v1/uploads/';

// Status badge
function StatusBadge({ status, lang }) {
  const s = (status || '').toLowerCase();
  // "Bajarilmagan" — topshirmagan
  // "Qabul qilindi" / "Accept" — qabul qilingan
  // "Rad etildi" / "Reject" — rad etilgan
  // "Kutilmoqda" / "Pending"
  if (s === 'bajarilmagan' || s === 'not done' || !s) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
        background: 'rgba(100,116,139,0.12)', color: '#64748b',
      }}>
        <InboxRoundedIcon style={{ fontSize: 12 }} />
        {lang === 'uz' ? "Topshirmagan" : "Не сдал"}
      </span>
    );
  }
  if (s.includes('qabul') || s.includes('accept') || s === 'accepted') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
        background: 'rgba(20,184,166,0.15)', color: '#0d9488',
      }}>
        <CheckCircleRoundedIcon style={{ fontSize: 12 }} />
        {lang === 'uz' ? "Qabul qilindi" : "Принято"}
      </span>
    );
  }
  if (s.includes('rad') || s.includes('reject')) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
        background: 'rgba(239,68,68,0.13)', color: '#ef4444',
      }}>
        <CancelRoundedIcon style={{ fontSize: 12 }} />
        {lang === 'uz' ? "Rad etildi" : "Отклонено"}
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
      background: 'rgba(245,158,11,0.13)', color: '#d97706',
    }}>
      <HourglassEmptyRoundedIcon style={{ fontSize: 12 }} />
      {lang === 'uz' ? "Kutilmoqda" : "Ожидание"}
    </span>
  );
}

export default function TeacherHomeworkCheck() {
  const { groupId, homeworkId } = useParams();
  const navigate = useNavigate();
  const { dark, lang } = useApp();

  // State
  const [lessonInfo,   setLessonInfo]   = useState(null); // { lessonId, topic }
  const [students,     setStudents]     = useState([]); // [{ id, full_name, answerStatus, answerData }]
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [saving,       setSaving]       = useState({}); // { studentId: true/false }
  const [saved,        setSaved]        = useState({}); // { studentId: true } — saved flash
  const [saveError,    setSaveError]    = useState({}); // { studentId: 'error msg' }

  // Per-student grade/title form state
  const gradeRef = useRef({}); // studentId → grade value
  const titleRef = useRef({}); // studentId → title value
  const [formState, setFormState] = useState({}); // { studentId: { grade, title } }

  const bg       = dark ? '#0a0a0f' : '#eef0f5';
  const cardBg   = dark ? '#111118' : '#ffffff';
  const border   = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub  = dark ? '#7070a0' : '#64748b';
  const inputBg  = dark ? '#1a1a28' : '#f8fafc';

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSaved({});
    setSaveError({});
    try {
      // 1. Homework listidan lessonId topamiz
      const hwListRes = await api.get(`/homework/${groupId}`);
      const hwList = hwListRes.data?.data ?? hwListRes.data ?? [];
      const hwArr  = Array.isArray(hwList) ? hwList : [];

      let lessonId = null;
      let topic    = null;
      for (const lesson of hwArr) {
        const found = lesson.homework?.find(h => String(h.id) === String(homeworkId));
        if (found) {
          lessonId = lesson.id;
          topic    = lesson.topic;
          break;
        }
      }
      setLessonInfo(lessonId ? { lessonId, topic } : null);

      // 2. Barcha talabalar (results endpoint)
      const resultsRes = await api.get(`/group/${groupId}/homework/${homeworkId}/results`);
      const stuList = resultsRes.data?.data ?? resultsRes.data ?? [];
      const stuArr  = Array.isArray(stuList) ? stuList : [];

      if (!stuArr.length) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // 3. Har bir talaba uchun per-student endpoint (lessonId bo'lsa)
      let enriched = stuArr;
      if (lessonId) {
        const answerPromises = stuArr.map(stu =>
          api.get(`/group/${groupId}/lesson/${lessonId}/homework/${homeworkId}/student/${stu.id}`)
            .then(r => ({ studentId: stu.id, data: r.data?.data ?? r.data, ok: true }))
            .catch(() => ({ studentId: stu.id, data: null, ok: false }))
        );
        const answers = await Promise.all(answerPromises);
        const answerMap = {};
        for (const a of answers) answerMap[a.studentId] = a;

        enriched = stuArr.map(stu => {
          const ans = answerMap[stu.id];
          return {
            ...stu,
            answerStatus: ans?.data?.status || null,
            // homework.id here = submission answer ID when student has submitted
            answerData:   ans?.data?.homework || null,
          };
        });
      } else {
        enriched = stuArr.map(stu => ({ ...stu, answerStatus: null, answerData: null }));
      }

      setStudents(enriched);

      // Form state boshlang'ich qiymatlar
      const fs = {};
      for (const stu of enriched) {
        fs[stu.id] = { grade: '', title: '' };
      }
      setFormState(fs);

    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [groupId, homeworkId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Handle form field change ─────────────────────────────────────────
  const handleField = (studentId, field, value) => {
    setFormState(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  // ── Handle check submit ──────────────────────────────────────────────
  const handleCheck = async (stu) => {
    const { grade, title } = formState[stu.id] || {};
    if (!grade || isNaN(Number(grade))) {
      setSaveError(prev => ({ ...prev, [stu.id]: lang === 'uz' ? "Ball kiritilmagan" : "Введите оценку" }));
      return;
    }
    if (!title || !title.trim()) {
      setSaveError(prev => ({ ...prev, [stu.id]: lang === 'uz' ? "Izoh kiritilmagan" : "Введите комментарий" }));
      return;
    }

    // Backend dizaynida homework_answer_id sifatida asosan studentId qabul qilinayotgani aniqlandi.
    // DTO da homework_answer_id deb nomlangan bo'lsa-da, student.id ni jo'natish 201 qaytaradi.
    const answerId = stu.id; // Backend student.id ni kutadi!
    if (!answerId) {
      setSaveError(prev => ({ ...prev, [stu.id]: lang === 'uz' ? "Talaba ID topilmadi" : "ID студента не найден" }));
      return;
    }

    setSaving(prev => ({ ...prev, [stu.id]: true }));
    setSaveError(prev => ({ ...prev, [stu.id]: null }));

    try {
      await api.post(`/group/${groupId}/homework/${homeworkId}/check`, {
        homework_answer_id: answerId,
        grade:  Number(grade),
        title:  title.trim(),
      });
      setSaved(prev => ({ ...prev, [stu.id]: true }));
      // 2 soniyadan keyin flash o'chirish
      setTimeout(() => setSaved(prev => ({ ...prev, [stu.id]: false })), 2500);
      // Ro'yxatni yangilash
      await fetchData();
    } catch (err) {
      let msg = err?.response?.data?.message;
      let errText = Array.isArray(msg) ? msg.join(', ') : (msg || err?.message || 'Xatolik');
      
      // Backendda talaba hali vazifani topshirmagan bo'lsa, 500 Internal Server Error qaytadi
      if (err?.response?.status === 500 || errText.toLowerCase().includes('internal server error')) {
        errText = lang === 'uz' ? "Talaba hali vazifani topshirmagan (Backend xatosi: 500)" : "Студент ещё не отправил ответ (Ошибка сервера: 500)";
      }

      setSaveError(prev => ({ ...prev, [stu.id]: errText }));
    } finally {
      setSaving(prev => ({ ...prev, [stu.id]: false }));
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────
  const totalSubmitted = students.filter(s => {
    const st = (s.answerStatus || '').toLowerCase();
    return st && st !== 'bajarilmagan';
  }).length;
  const totalStudents = students.length;

  return (
    <div style={{ padding: '20px 0' }}>

      {/* ── Back ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          marginBottom: 20, padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
          background: dark ? '#1a1a28' : '#f8fafc', border: `1px solid ${border}`,
          color: textSub, fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s',
        }}
        onMouseOver={e => { e.currentTarget.style.color = '#14b8a6'; e.currentTarget.style.borderColor = '#14b8a6'; }}
        onMouseOut={e => { e.currentTarget.style.color = textSub; e.currentTarget.style.borderColor = border; }}
      >
        <ArrowBackRoundedIcon style={{ fontSize: 17 }} />
        {lang === 'uz' ? "Orqaga" : "Назад"}
      </button>

      {/* ── Header card ──────────────────────────────────────────────── */}
      <div style={{
        background: cardBg, border: `1px solid ${border}`,
        borderRadius: 16, padding: '20px 24px', marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #14b8a6, #06b6d4)',
        }} />
        {loading ? (
          <Skeleton variant="text" width={260} height={30} style={{ marginTop: 4 }} />
        ) : (
          <div style={{ paddingTop: 4 }}>
            <h1 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 800, color: textMain }}>
              {lang === 'uz' ? "Vazifa tekshirish" : "Проверка задания"}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {lessonInfo && (
                <span style={{ color: textSub, fontSize: '0.83rem' }}>
                  📚 {lessonInfo.topic || (lang === 'uz' ? 'Mavzusiz dars' : 'Без темы')}
                </span>
              )}
              <span style={{ color: textSub, fontSize: '0.83rem' }}>
                👥 {lang === 'uz' ? `${totalSubmitted}/${totalStudents} ta topshirgan` : `${totalSubmitted}/${totalStudents} сдали`}
              </span>
            </div>
          </div>
        )}
        <button onClick={fetchData} style={{
          position: 'absolute', top: 14, right: 16,
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 13px', borderRadius: 8, cursor: 'pointer',
          background: dark ? '#1a1a28' : '#f8fafc', border: `1px solid ${border}`,
          color: textSub, fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s',
        }}
          onMouseOver={e => { e.currentTarget.style.color = '#14b8a6'; e.currentTarget.style.borderColor = '#14b8a6'; }}
          onMouseOut={e => { e.currentTarget.style.color = textSub; e.currentTarget.style.borderColor = border; }}
        >
          <RefreshRoundedIcon style={{ fontSize: 15 }} />
          {lang === 'uz' ? "Yangilash" : "Обновить"}
        </button>
      </div>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {error && !loading && (
        <div style={{
          background: dark ? 'rgba(239,68,68,0.1)' : '#fff1f0',
          border: `1px solid ${dark ? 'rgba(239,68,68,0.25)' : '#ffd6d6'}`,
          borderRadius: 14, padding: '28px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <WifiOffRoundedIcon style={{ fontSize: 36, color: '#ef4444', opacity: 0.7 }} />
          <p style={{ margin: 0, fontWeight: 700, color: '#ef4444' }}>{error}</p>
          <button onClick={fetchData} style={{
            padding: '8px 20px', borderRadius: 10, background: '#ef4444',
            color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer',
          }}>
            {lang === 'uz' ? "Qayta urinish" : "Повторить"}
          </button>
        </div>
      )}

      {/* ── Loading skeletons ────────────────────────────────────────── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              background: cardBg, border: `1px solid ${border}`,
              borderRadius: 14, padding: '18px 20px',
              display: 'flex', gap: 16, alignItems: 'center',
            }}>
              <Skeleton variant="circular" width={42} height={42} />
              <div style={{ flex: 1 }}>
                <Skeleton variant="text" width={180} height={20} />
                <Skeleton variant="text" width={100} height={16} />
              </div>
              <Skeleton variant="rounded" width={220} height={36} style={{ borderRadius: 8 }} />
              <Skeleton variant="rounded" width={220} height={36} style={{ borderRadius: 8 }} />
              <Skeleton variant="rounded" width={90} height={36} style={{ borderRadius: 8 }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty ────────────────────────────────────────────────────── */}
      {!loading && !error && students.length === 0 && (
        <div style={{
          background: cardBg, border: `1px solid ${border}`,
          borderRadius: 16, padding: '56px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          <InboxRoundedIcon style={{ fontSize: 40, color: textSub, opacity: 0.5 }} />
          <p style={{ margin: 0, fontWeight: 700, color: textMain }}>
            {lang === 'uz' ? "Talabalar topilmadi" : "Ученики не найдены"}
          </p>
        </div>
      )}

      {/* ── Student cards ────────────────────────────────────────────── */}
      {!loading && !error && students.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {students.map((stu, idx) => {
            // ── Real status ──────────────────────────────────────────────
            const rawStatus = (stu.answerStatus || '').toLowerCase();
            // Talaba haqiqatan javob yuborgan bo'lsa FAQAT baholash mumkin
            const hasAnswer = rawStatus && rawStatus !== 'bajarilmagan' && rawStatus !== 'not done' && rawStatus !== 'not_done';
            const answerId  = stu.id; // Backend kutadigan ID
            const file      = stu.answerData?.file;
            const initials  = (stu.full_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            const form      = formState[stu.id] || { grade: '', title: '' };
            const isSaving  = saving[stu.id];
            const isSaved   = saved[stu.id];
            const errMsg    = saveError[stu.id];

            return (
              <div key={stu.id} style={{
                background: cardBg, border: `1px solid ${isSaved ? '#14b8a6' : border}`,
                borderRadius: 14, padding: '18px 20px',
                transition: 'border-color 0.3s',
                boxShadow: isSaved ? '0 0 0 2px rgba(20,184,166,0.15)' : 'none',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>

                  {/* Avatar + Name + Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 200, flex: '0 0 auto' }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                      background: `hsl(${(stu.id * 47) % 360}, 60%, 52%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                    }}>
                      {initials || <PersonRoundedIcon style={{ fontSize: 20 }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: textMain }}>
                        {stu.full_name || '—'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <StatusBadge status={stu.answerStatus} lang={lang} />
                        {/* File link */}
                        {file && (
                          <a
                            href={`${FILE_BASE}${file}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              fontSize: '0.73rem', color: '#6366f1', fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            <InsertDriveFileRoundedIcon style={{ fontSize: 13 }} />
                            {lang === 'uz' ? "Fayl" : "Файл"}
                            <OpenInNewRoundedIcon style={{ fontSize: 11 }} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Grading form — faqat javob topshirgan talabalar uchun */}
                  <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end', minWidth: 0 }}>

                    {/* Topshirmagan talaba uchun xabar */}
                    {!hasAnswer && (
                      <div style={{
                        flex: 1, padding: '9px 14px', borderRadius: 8,
                        background: dark ? 'rgba(100,116,139,0.1)' : '#f8fafc',
                        border: `1px dashed ${dark ? '#2e2e40' : '#e2e8f0'}`,
                        color: textSub, fontSize: '0.82rem', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <InboxRoundedIcon style={{ fontSize: 16, opacity: 0.6 }} />
                        {lang === 'uz' ? "Talaba hali vazifani topshirmagan" : "Студент ещё не отправил задание"}
                      </div>
                    )}

                    {/* Ball */}
                    {hasAnswer && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 90 }}>
                      <label style={{ fontSize: '0.72rem', color: textSub, fontWeight: 600 }}>
                        {lang === 'uz' ? "Ball (0–100)" : "Оценка (0–100)"}
                      </label>
                      <input
                        type="number" min={0} max={100}
                        placeholder={lang === 'uz' ? "Ball kiriting" : "Введите балл"}
                        value={form.grade}
                        onChange={e => handleField(stu.id, 'grade', e.target.value)}
                        disabled={isSaving}
                        style={{
                          width: 90, padding: '8px 10px', borderRadius: 8,
                          border: `1px solid ${border}`, background: inputBg,
                          color: textMain,
                          fontSize: '0.88rem', fontWeight: 600, outline: 'none',
                          fontFamily: 'inherit', transition: 'border-color 0.2s',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#14b8a6'; }}
                        onBlur={e => e.target.style.borderColor = border}
                      />
                    </div>
                    )}

                    {/* Izoh */}
                    {hasAnswer && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 160 }}>
                      <label style={{ fontSize: '0.72rem', color: textSub, fontWeight: 600 }}>
                        {lang === 'uz' ? "Izoh (title)" : "Комментарий (title)"}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === 'uz' ? "Masalan: Ajoyib bajarildi" : "Например: Отлично выполнено"}
                        value={form.title}
                        onChange={e => handleField(stu.id, 'title', e.target.value)}
                        disabled={isSaving}
                        style={{
                          padding: '8px 12px', borderRadius: 8,
                          border: `1px solid ${border}`, background: inputBg,
                          color: textMain,
                          fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#14b8a6'; }}
                        onBlur={e => e.target.style.borderColor = border}
                        onKeyDown={e => { if (e.key === 'Enter') handleCheck(stu); }}
                      />
                    </div>
                    )}

                    {/* Save button — FAQAT topshirgan talabalar uchun */}
                    {hasAnswer && (
                    <button
                      onClick={() => handleCheck(stu)}
                      disabled={isSaving}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 18px', borderRadius: 8, border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer',
                        background: isSaved
                          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                          : 'linear-gradient(135deg, #14b8a6, #0d9488)',
                        color: '#fff',
                        fontWeight: 700, fontSize: '0.83rem',
                        boxShadow: '0 2px 8px rgba(20,184,166,0.28)',
                        opacity: isSaving ? 0.7 : 1,
                        transition: 'all 0.25s', alignSelf: 'flex-end',
                      }}
                    >
                      {isSaving ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                          {lang === 'uz' ? "Saqlanmoqda..." : "Сохранение..."}
                        </span>
                      ) : isSaved ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <CheckCircleRoundedIcon style={{ fontSize: 16 }} />
                          {lang === 'uz' ? "Saqlandi!" : "Сохранено!"}
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <SaveRoundedIcon style={{ fontSize: 16 }} />
                          {lang === 'uz' ? "Saqlash" : "Сохранить"}
                        </span>
                      )}
                    </button>
                    )}
                  </div>
                </div>

                {/* Error message */}
                {errMsg && (
                  <div style={{
                    marginTop: 10, padding: '7px 12px', borderRadius: 8,
                    background: dark ? 'rgba(239,68,68,0.12)' : '#fff1f0',
                    border: `1px solid ${dark ? 'rgba(239,68,68,0.2)' : '#ffd6d6'}`,
                    color: '#ef4444', fontSize: '0.8rem', fontWeight: 600,
                  }}>
                    ⚠ {errMsg}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
