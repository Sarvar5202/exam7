import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import Skeleton from '@mui/material/Skeleton';
import { getMyGroups, getMyGroupLessons } from '../../api/studentApi';
import StudentCalendar from '../../components/StudentCalendar/StudentCalendar';

export default function StudentDashboard() {
  const { dark, lang } = useApp();

  const cardBg   = dark ? '#111118' : '#ffffff';
  const border   = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub  = dark ? '#8888aa' : '#64748b';

  const [groups, setGroups]     = useState([]);
  const [lessons, setLessons]   = useState([]);
  const [loading, setLoading]   = useState(true);

  // Sessiyadan student ma'lumotlari
  const studentUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('studentUser')) || {}; }
    catch { return {}; }
  })();
  const fullName = studentUser.full_name || 'Student';
  const firstName = fullName.split(' ')[0] || fullName;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getMyGroups();
        const data = res.data?.data || res.data || [];
        const arr = Array.isArray(data) ? data : [];
        setGroups(arr);

        // Birinchi guruhning darslarini yuklaymiz (jadval uchun)
        if (arr.length > 0) {
          const groupId = arr[0]?.groupId || arr[0]?.id || arr[0]?.group?.id;
          if (groupId) {
            const lessonsRes = await getMyGroupLessons(groupId);
            const lessonsData = lessonsRes.data?.data || lessonsRes.data || [];
            setLessons(Array.isArray(lessonsData) ? lessonsData.slice(0, 3) : []);
          }
        }
      } catch (e) {
        setGroups([]);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Jami darslar soni
  const totalLessons = groups.reduce((sum, g) => {
    return sum + (g?.lessons_count || g?.group?.lessons_count || 0);
  }, 0);

  const stats = [
    {
      icon: <GroupRoundedIcon />,
      label: lang === 'uz' ? 'Guruhlarim' : 'Мои группы',
      value: loading ? '—' : String(groups.length),
      color: '#6c35de',
      bg: dark ? 'rgba(108,53,222,0.15)' : '#f3f0ff',
    },
    {
      icon: <SchoolRoundedIcon />,
      label: lang === 'uz' ? 'Umumiy darslar' : 'Всего уроков',
      value: loading ? '—' : String(totalLessons || lessons.length || '0'),
      color: '#3b82f6',
      bg: dark ? 'rgba(59,130,246,0.15)' : '#eff6ff',
    },
    {
      icon: <EmojiEventsRoundedIcon />,
      label: lang === 'uz' ? 'Guruhlar soni' : 'Кол-во групп',
      value: loading ? '—' : String(groups.length),
      color: '#f97316',
      bg: dark ? 'rgba(249,115,22,0.15)' : '#fff7ed',
    },
    {
      icon: <TrendingUpRoundedIcon />,
      label: lang === 'uz' ? 'Faol darslar' : 'Активных уроков',
      value: loading ? '—' : String(lessons.length),
      color: '#22c55e',
      bg: dark ? 'rgba(34,197,94,0.15)' : '#f0fdf4',
    },
  ];

  return (
    <div className="pt-6 flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: textMain, margin: 0 }}>
          {lang === 'uz' ? 'Salom' : 'Привет'}, {firstName}! 👋
        </h1>
        <p style={{ fontSize: '0.88rem', color: textSub, marginTop: 4 }}>
          {lang === 'uz'
            ? 'Bugungi darslaringiz va natijalaringiz bilan tanishing'
            : 'Ознакомьтесь с вашими занятиями и результатами'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: cardBg, borderRadius: 16, padding: '20px',
              border: `1px solid ${border}`, transition: 'all 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color, marginBottom: 12,
            }}>
              {s.icon}
            </div>
            <p style={{ fontSize: '0.82rem', color: textSub, marginBottom: 4 }}>{s.label}</p>
            {loading
              ? <Skeleton variant="text" width={60} height={36} sx={{ borderRadius: 2 }} />
              : <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: textMain, margin: 0 }}>{s.value}</h2>
            }
          </div>
        ))}
      </div>

      {/* Asosiy qism: Chapda Guruhlar, O'ngda Kalendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chap tomon: Guruhlar */}
        <div className="lg:col-span-2" style={{
          background: cardBg, borderRadius: 16, padding: '24px',
          border: `1px solid ${border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: dark ? 'rgba(59,130,246,0.15)' : '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6',
          }}>
            <CalendarMonthRoundedIcon />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: textMain, margin: 0 }}>
            {lang === 'uz' ? 'Mening guruhlarim' : 'Мои группы'}
          </h3>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2].map(i => (
              <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2 }} />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p style={{ color: textSub, fontSize: '0.88rem', textAlign: 'center', padding: '32px 0' }}>
            {lang === 'uz' ? "Hozircha guruh yo'q" : 'Групп пока нет'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {groups.map((g, i) => {
              const group = g?.group || g;
              const gName = group?.groupName || group?.name || `Guruh ${i + 1}`;
              const gCourse = group?.courseName || group?.course?.name || '';
              const gTeacher = group?.teachers?.[0]?.full_name || group?.teacher?.full_name || group?.teacher_name || '';
              const gRoom = group?.room?.name ? ` • ${group.room.name}` : '';
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '14px 16px', borderRadius: 12,
                    background: dark ? '#16161f' : '#f8fafc',
                    border: `1px solid ${border}`, transition: 'all 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#6c35de'}
                  onMouseOut={e => e.currentTarget.style.borderColor = border}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, minWidth: 80,
                    color: '#6c35de', fontWeight: 700, fontSize: '0.9rem',
                  }}>
                    <AccessTimeRoundedIcon style={{ fontSize: 18 }} />
                    {gName}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: textMain, fontSize: '0.9rem' }}>
                        {gName}
                      </span>
                      {gCourse && (
                        <span style={{
                          padding: '2px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                          background: dark ? 'rgba(108,53,222,0.2)' : '#f3f0ff', color: '#6c35de',
                        }}>
                          {gCourse}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: textSub, margin: 0 }}>
                      {gTeacher}
                      {gRoom}
                    </p>
                  </div>
                  <div style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                    background: dark ? 'rgba(34,197,94,0.15)' : '#f0fdf4',
                    color: '#22c55e',
                  }}>
                    {lang === 'uz' ? 'Faol' : 'Активна'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

        {/* O'ng tomon: Kalendar */}
        <div className="lg:col-span-1">
          <StudentCalendar />
        </div>
      </div>

      {/* Darslar */}
      {!loading && lessons.length > 0 && (
        <div style={{
          background: cardBg, borderRadius: 16, padding: '24px',
          border: `1px solid ${border}`, marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: dark ? 'rgba(249,115,22,0.15)' : '#fff7ed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316',
            }}>
              <TrendingUpRoundedIcon />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: textMain, margin: 0 }}>
              {lang === 'uz' ? 'So\'nggi darslar' : 'Последние уроки'}
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lessons.map((lesson, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderBottom: i < lessons.length - 1 ? `1px solid ${border}` : 'none',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#3b82f6', flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', color: textMain, margin: 0, fontWeight: 500 }}>
                    {lesson?.topic || lesson?.title || lesson?.name || `Dars ${i + 1}`}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: textSub, margin: 0, marginTop: 2 }}>
                    {lesson?.created_at?.slice(0, 10) || lesson?.date || ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
