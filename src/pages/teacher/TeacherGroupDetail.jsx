import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/api';
import Skeleton from '@mui/material/Skeleton';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

// Sana formatlash
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Skeleton qatorlari
function SkeletonRow({ cols, dark }) {
  const border = dark ? '#1e1e2a' : '#f0f0f5';
  return (
    <tr style={{ borderBottom: `1px solid ${border}` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '13px 16px' }}>
          <Skeleton variant="text" width={i === 0 ? 24 : i === 1 ? 140 : 80} height={18} />
        </td>
      ))}
    </tr>
  );
}

export default function TeacherGroupDetail() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { dark, lang } = useApp();

  const [group,    setGroup]    = useState(null);
  const [lessons,  setLessons]  = useState([]);
  const [hwMap,    setHwMap]    = useState({}); // lessonId → [{ id, homeworkPending, homeworkAccept, homeworkReject, homework }]
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'students'

  const bg       = dark ? '#0a0a0f' : '#eef0f5';
  const cardBg   = dark ? '#111118' : '#ffffff';
  const border   = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub  = dark ? '#7070a0' : '#64748b';

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Guruh ma'lumotlari (students ichida) — my/groups dan o'sha guruhni topamiz
      const [groupsRes, lessonsRes, hwRes] = await Promise.all([
        api.get('/teachers/my/groups'),
        api.get(`/lessons/my/group/${groupId}`),
        api.get(`/homework/${groupId}`),
      ]);

      // Guruh
      const allGroups = groupsRes.data?.data ?? groupsRes.data ?? [];
      const found = Array.isArray(allGroups)
        ? allGroups.find(g => String(g.id) === String(groupId))
        : null;
      setGroup(found || null);

      // Darslar
      const lessArr = Array.isArray(lessonsRes.data?.data ?? lessonsRes.data)
        ? (lessonsRes.data?.data ?? lessonsRes.data)
        : [];
      // Sanaga qarab tartiblash (yangi birinchi)
      setLessons(lessArr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

      // Homework holati: lessonId → homework items ro'yxati
      const hwArr = Array.isArray(hwRes.data?.data ?? hwRes.data)
        ? (hwRes.data?.data ?? hwRes.data)
        : [];
      // Bir lessonId uchun bir nechta hw bo'lishi mumkin — map qilamiz
      const map = {};
      for (const item of hwArr) {
        const lid = String(item.id); // lessonId
        if (!map[lid]) map[lid] = [];
        map[lid].push(item);
      }
      setHwMap(map);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Guruh meta
  const groupName   = group?.name || `Guruh #${groupId}`;
  const courseName  = group?.course?.name || '—';
  const room        = typeof group?.room === 'string' ? group.room : (group?.room?.name || '—');
  const studentCount = group?.student_count ?? group?.students?.length ?? 0;
  const students    = group?.students || [];

  return (
    <div style={{ padding: '20px 0' }}>

      {/* ── Back button ──────────────────────────────────────────── */}
      <button onClick={() => navigate('/teacher/groups')} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        marginBottom: 20, padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
        background: dark ? '#1a1a28' : '#f8fafc', border: `1px solid ${border}`,
        color: textSub, fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s',
      }}
        onMouseOver={e => { e.currentTarget.style.color = '#14b8a6'; e.currentTarget.style.borderColor = '#14b8a6'; }}
        onMouseOut={e => { e.currentTarget.style.color = textSub; e.currentTarget.style.borderColor = border; }}
      >
        <ArrowBackRoundedIcon style={{ fontSize: 17 }} />
        {lang === 'uz' ? "Guruhlar ro'yxati" : "Список групп"}
      </button>

      {/* ── Error state ────────────────────────────────────────────── */}
      {error && !loading && (
        <div style={{
          background: dark ? 'rgba(239,68,68,0.1)' : '#fff1f0',
          border: `1px solid ${dark ? 'rgba(239,68,68,0.25)' : '#ffd6d6'}`,
          borderRadius: 14, padding: '32px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <WifiOffRoundedIcon style={{ fontSize: 40, color: '#ef4444', opacity: 0.7 }} />
          <p style={{ margin: 0, fontWeight: 700, color: '#ef4444' }}>
            {lang === 'uz' ? "Ma'lumot yuklanmadi" : "Не удалось загрузить"}
          </p>
          <p style={{ margin: 0, color: textSub, fontSize: '0.85rem' }}>{error}</p>
          <button onClick={fetchAll} style={{
            padding: '9px 22px', borderRadius: 10, background: '#ef4444',
            color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer',
          }}>
            {lang === 'uz' ? "Qayta urinish" : "Попробовать снова"}
          </button>
        </div>
      )}

      {/* ── Group Header card ──────────────────────────────────────── */}
      {!error && (
        <div style={{
          background: cardBg, border: `1px solid ${border}`,
          borderRadius: 16, padding: '20px 24px', marginBottom: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Teal top accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, #14b8a6, #06b6d4)',
          }} />

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
              <Skeleton variant="text" width={200} height={32} />
              <div style={{ display: 'flex', gap: 24 }}>
                <Skeleton variant="text" width={120} height={20} />
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={90} height={20} />
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingTop: 4 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(20,184,166,0.28)',
                }}>
                  <GroupRoundedIcon style={{ color: '#fff', fontSize: 26 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: 800, color: textMain }}>
                    {groupName}
                  </h1>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: textSub, fontSize: '0.85rem' }}>
                      <SchoolRoundedIcon style={{ fontSize: 16, color: '#14b8a6' }} />
                      {courseName}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: textSub, fontSize: '0.85rem' }}>
                      <MeetingRoomRoundedIcon style={{ fontSize: 16, color: '#6366f1' }} />
                      {room}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: textSub, fontSize: '0.85rem' }}>
                      <PeopleRoundedIcon style={{ fontSize: 16, color: '#f59e0b' }} />
                      {studentCount} {lang === 'uz' ? 'talaba' : 'учеников'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      {!error && (
        <div style={{
          display: 'flex', gap: 6, marginBottom: 16,
          background: cardBg, border: `1px solid ${border}`,
          borderRadius: 12, padding: 6,
        }}>
          {[
            { key: 'lessons', icon: <AssignmentRoundedIcon style={{ fontSize: 17 }} />, uz: 'Darslar va vazifalar', ru: 'Уроки и задания' },
            { key: 'students', icon: <PeopleRoundedIcon style={{ fontSize: 17 }} />, uz: "Talabalar ro'yxati", ru: 'Список учеников' },
          ].map(tab => {
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 14px', borderRadius: 8, cursor: 'pointer', border: 'none',
                fontWeight: active ? 700 : 500, fontSize: '0.85rem',
                background: active ? '#14b8a6' : 'transparent',
                color: active ? '#fff' : textSub, transition: 'all 0.2s',
              }}>
                {tab.icon}
                {lang === 'uz' ? tab.uz : tab.ru}
              </button>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 1 — DARSLAR VA HOMEWORK HOLATI
      ══════════════════════════════════════════════════════════════ */}
      {!error && activeTab === 'lessons' && (
        <div style={{
          background: cardBg, border: `1px solid ${border}`,
          borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {[
                    '#',
                    lang === 'uz' ? 'Dars mavzusi' : 'Тема урока',
                    lang === 'uz' ? 'Sana' : 'Дата',
                    lang === 'uz' ? "Vazifalar (qabul/rad/kut.)" : 'Задания (пр./откл./ожид.)',
                    lang === 'uz' ? 'Amal' : 'Действие',
                  ].map((h, i) => (
                    <th key={i} style={{
                      textAlign: i === 3 ? 'center' : 'left',
                      padding: '13px 16px', fontWeight: 700,
                      color: textMain, fontSize: '0.82rem', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} cols={5} dark={dark} />)
                  : lessons.length === 0
                    ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '56px 20px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                            <InboxRoundedIcon style={{ fontSize: 36, color: textSub, opacity: 0.5 }} />
                            <span style={{ color: textSub, fontSize: '0.9rem' }}>
                              {lang === 'uz' ? "Hali darslar yo'q" : "Уроков пока нет"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                    : lessons.map((lesson, idx) => {
                        const lid = String(lesson.id);
                        const hwItems = hwMap[lid] || [];

                        // Barcha hwItem uchun umumiy statistika
                        const totalAccept  = hwItems.reduce((s, h) => s + (h.homeworkAccept  || 0), 0);
                        const totalReject  = hwItems.reduce((s, h) => s + (h.homeworkReject  || 0), 0);
                        const totalPending = hwItems.reduce((s, h) => s + (h.homeworkPending || 0), 0);
                        const hwCount      = hwItems.length;

                        // Navigate uchun birinchi homework id
                        const firstHwId = hwItems[0]?.homework?.[0]?.id;

                        return (
                          <tr key={lesson.id} style={{
                            borderBottom: `1px solid ${border}`, transition: 'background 0.15s',
                          }}>
                            {/* # */}
                            <td style={{ padding: '13px 16px', color: textSub, fontSize: '0.8rem', fontWeight: 500 }}>
                              {idx + 1}
                            </td>

                            {/* Mavzu */}
                            <td style={{ padding: '13px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                  background: dark ? 'rgba(20,184,166,0.1)' : 'rgba(20,184,166,0.08)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  <AssignmentRoundedIcon style={{ fontSize: 16, color: '#14b8a6' }} />
                                </div>
                                <span style={{ color: textMain, fontWeight: 600, fontSize: '0.875rem' }}>
                                  {lesson.topic || (lang === 'uz' ? 'Mavzusiz' : 'Без темы')}
                                </span>
                              </div>
                            </td>

                            {/* Sana */}
                            <td style={{ padding: '13px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CalendarMonthRoundedIcon style={{ fontSize: 15, color: textSub }} />
                                <span style={{ color: textSub, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                  {fmtDate(lesson.created_at)}
                                </span>
                              </div>
                            </td>

                            {/* Homework holati */}
                            <td style={{ padding: '13px 16px' }}>
                              {hwCount === 0 ? (
                                <span style={{ color: textSub, fontSize: '0.8rem' }}>
                                  {lang === 'uz' ? "Vazifa yo'q" : "Нет задания"}
                                </span>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                                  {/* Qabul */}
                                  <span style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '3px 9px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
                                    background: dark ? 'rgba(20,184,166,0.15)' : '#d1faf4', color: '#0d9488',
                                  }}>
                                    <CheckCircleRoundedIcon style={{ fontSize: 13 }} />
                                    {totalAccept}
                                  </span>
                                  {/* Rad */}
                                  <span style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '3px 9px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
                                    background: dark ? 'rgba(239,68,68,0.15)' : '#fff1f0', color: '#ef4444',
                                  }}>
                                    <CancelRoundedIcon style={{ fontSize: 13 }} />
                                    {totalReject}
                                  </span>
                                  {/* Kutilmoqda */}
                                  <span style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '3px 9px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
                                    background: dark ? 'rgba(245,158,11,0.15)' : '#fef3c7', color: '#d97706',
                                  }}>
                                    <HourglassEmptyRoundedIcon style={{ fontSize: 13 }} />
                                    {totalPending}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Amal */}
                            <td style={{ padding: '13px 16px' }}>
                              {hwItems.length > 0 && firstHwId ? (
                                hwItems.map((hwItem) => {
                                  const hwId = hwItem.homework?.[0]?.id;
                                  if (!hwId) return null;
                                  return (
                                    <button
                                      key={hwId}
                                      onClick={() => navigate(`/teacher/groups/${groupId}/homework/${hwId}/check`)}
                                      style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        padding: '6px 13px', borderRadius: 8, cursor: 'pointer', border: 'none',
                                        background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                                        color: '#fff', fontSize: '0.78rem', fontWeight: 700,
                                        boxShadow: '0 2px 6px rgba(20,184,166,0.25)',
                                        marginRight: 4, marginBottom: 4,
                                        transition: 'box-shadow 0.2s',
                                      }}
                                      onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(20,184,166,0.4)'}
                                      onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 6px rgba(20,184,166,0.25)'}
                                    >
                                      {lang === 'uz' ? "Tekshirish" : "Проверить"}
                                      <ChevronRightRoundedIcon style={{ fontSize: 15 }} />
                                    </button>
                                  );
                                })
                              ) : (
                                <span style={{ color: textSub, fontSize: '0.8rem' }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 2 — TALABALAR RO'YXATI
      ══════════════════════════════════════════════════════════════ */}
      {!error && activeTab === 'students' && (
        <div style={{
          background: cardBg, border: `1px solid ${border}`,
          borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {['#', lang === 'uz' ? 'Ism Familiya' : 'ФИО', 'ID'].map((h, i) => (
                    <th key={i} style={{
                      textAlign: 'left', padding: '13px 16px',
                      fontWeight: 700, color: textMain, fontSize: '0.82rem',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} cols={3} dark={dark} />)
                  : students.length === 0
                    ? (
                      <tr>
                        <td colSpan={3} style={{ padding: '56px 20px', textAlign: 'center', color: textSub }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                            <InboxRoundedIcon style={{ fontSize: 36, opacity: 0.5 }} />
                            <span>{lang === 'uz' ? "Talabalar topilmadi" : "Ученики не найдены"}</span>
                          </div>
                        </td>
                      </tr>
                    )
                    : students.map((stu, idx) => {
                        const initials = (stu.full_name || '?')
                          .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                        return (
                          <tr key={stu.id} style={{
                            borderBottom: `1px solid ${border}`, transition: 'background 0.15s',
                          }}
                            onMouseOver={e => e.currentTarget.style.background = dark ? '#16161f' : '#fafbff'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '11px 16px', color: textSub, fontSize: '0.8rem' }}>{idx + 1}</td>
                            <td style={{ padding: '11px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                                  background: `hsl(${(stu.id * 47) % 360}, 65%, 55%)`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: '#fff', fontWeight: 700, fontSize: '0.78rem',
                                }}>
                                  {initials || <PersonRoundedIcon style={{ fontSize: 18 }} />}
                                </div>
                                <span style={{ color: textMain, fontWeight: 600 }}>{stu.full_name || '—'}</span>
                              </div>
                            </td>
                            <td style={{ padding: '11px 16px', color: textSub, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                              #{stu.id}
                            </td>
                          </tr>
                        );
                      })
                }
              </tbody>
            </table>
          </div>
          {!loading && students.length > 0 && (
            <div style={{
              padding: '12px 16px', borderTop: `1px solid ${border}`,
              color: textSub, fontSize: '0.8rem', fontWeight: 500,
            }}>
              {lang === 'uz'
                ? `Jami: ${students.length} ta talaba`
                : `Всего: ${students.length} учеников`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
