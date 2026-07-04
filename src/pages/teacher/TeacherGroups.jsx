import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/api';
import Skeleton from '@mui/material/Skeleton';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

// Hafta kunlarini o'zbekchaga o'girish
const WEEKDAYS_UZ = {
  MONDAY: 'Dushanba', TUESDAY: 'Seshanba', WEDNESDAY: 'Chorshanba',
  THURSDAY: 'Payshanba', FRIDAY: 'Juma', SATURDAY: 'Shanba', SUNDAY: 'Yakshanba',
};
const WEEKDAYS_RU = {
  MONDAY: 'Пн', TUESDAY: 'Вт', WEDNESDAY: 'Ср',
  THURSDAY: 'Чт', FRIDAY: 'Пт', SATURDAY: 'Сб', SUNDAY: 'Вс',
};

// Status rangi
function statusStyle(status, dark) {
  const s = (status || '').toUpperCase();
  if (s === 'ACTIVE')   return { bg: dark ? 'rgba(20,184,166,0.18)' : '#d1faf4', text: '#0d9488' };
  if (s === 'FINISHED') return { bg: dark ? 'rgba(100,116,139,0.18)' : '#f1f5f9', text: '#64748b' };
  if (s === 'PENDING')  return { bg: dark ? 'rgba(245,158,11,0.18)' : '#fef3c7', text: '#d97706' };
  return { bg: dark ? 'rgba(100,116,139,0.15)' : '#f8fafc', text: '#94a3b8' };
}

function statusLabel(status, lang) {
  const s = (status || '').toUpperCase();
  if (s === 'ACTIVE')   return lang === 'uz' ? 'Faol' : 'Активный';
  if (s === 'FINISHED') return lang === 'uz' ? 'Tugagan' : 'Завершён';
  if (s === 'PENDING')  return lang === 'uz' ? 'Kutilmoqda' : 'Ожидание';
  return status || '—';
}

// Skeleton karta
function SkeletonCard({ dark }) {
  const cardBg = dark ? '#111118' : '#ffffff';
  const border = dark ? '#1e1e2a' : '#f0f0f5';
  return (
    <div style={{
      background: cardBg, border: `1px solid ${border}`,
      borderRadius: 16, padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Skeleton variant="rounded" width={180} height={22} />
        <Skeleton variant="rounded" width={64} height={24} style={{ borderRadius: 20 }} />
      </div>
      <Skeleton variant="rounded" width={120} height={18} />
      <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
        <Skeleton variant="rounded" width={90} height={16} />
        <Skeleton variant="rounded" width={80} height={16} />
        <Skeleton variant="rounded" width={70} height={16} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Skeleton variant="rounded" width={100} height={34} style={{ borderRadius: 10 }} />
      </div>
    </div>
  );
}

export default function TeacherGroups() {
  const { dark, lang } = useApp();
  const navigate = useNavigate();

  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  const bg       = dark ? '#0a0a0f' : '#eef0f5';
  const cardBg   = dark ? '#111118' : '#ffffff';
  const border   = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub  = dark ? '#7070a0' : '#64748b';

  const TABS = [
    { key: 'ALL',      label_uz: 'Barchasi',    label_ru: 'Все' },
    { key: 'ACTIVE',   label_uz: 'Faol',        label_ru: 'Активные' },
    { key: 'FINISHED', label_uz: 'Tugagan',     label_ru: 'Завершённые' },
    { key: 'PENDING',  label_uz: 'Kutilmoqda',  label_ru: 'Ожидание' },
  ];

  async function fetchGroups() {
    setLoading(true);
    setError(null);
    try {
      // Backend o'qituvchiga faqat o'zining guruhlarini ko'rishga ruxsat beradi
      const res  = await api.get('/teachers/my/groups');
      const data = res.data?.data ?? res.data ?? [];
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Xatolik yuz berdi');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchGroups(); }, []);

  // Tab bo'yicha filtrlash
  const filtered = activeTab === 'ALL'
    ? groups
    : groups.filter(g => (g.status || '').toUpperCase() === activeTab);

  return (
    <div style={{ padding: '24px 0' }}>
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(20,184,166,0.3)',
          }}>
            <GroupRoundedIcon style={{ color: '#fff', fontSize: 24 }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: textMain }}>
              {lang === 'uz' ? "Guruhlarim" : "Мои группы"}
            </h1>
            {!loading && !error && (
              <p style={{ margin: 0, fontSize: '0.82rem', color: textSub }}>
                {lang === 'uz'
                  ? `Jami ${groups.length} ta guruh`
                  : `Всего ${groups.length} групп`}
              </p>
            )}
          </div>
        </div>

        {/* Refresh button */}
        <button onClick={fetchGroups} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
          background: dark ? '#1a1a28' : '#f8fafc', border: `1px solid ${border}`,
          color: textSub, fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s',
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = '#14b8a6'; e.currentTarget.style.color = '#14b8a6'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textSub; }}
        >
          <RefreshRoundedIcon style={{ fontSize: 17 }} />
          {lang === 'uz' ? "Yangilash" : "Обновить"}
        </button>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap',
        background: cardBg, border: `1px solid ${border}`,
        borderRadius: 12, padding: 6,
      }}>
        {TABS.map(tab => {
          const count = tab.key === 'ALL'
            ? groups.length
            : groups.filter(g => (g.status || '').toUpperCase() === tab.key).length;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex: 1, minWidth: 90,
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer', border: 'none',
              fontWeight: isActive ? 700 : 500, fontSize: '0.83rem',
              background: isActive ? '#14b8a6' : 'transparent',
              color: isActive ? '#fff' : textSub,
              transition: 'all 0.2s',
            }}>
              {lang === 'uz' ? tab.label_uz : tab.label_ru}
              {!loading && (
                <span style={{
                  marginLeft: 6, padding: '1px 7px', borderRadius: 20,
                  background: isActive ? 'rgba(255,255,255,0.25)' : (dark ? '#1e1e2a' : '#f1f5f9'),
                  color: isActive ? '#fff' : textSub,
                  fontSize: '0.75rem', fontWeight: 700,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Error state ──────────────────────────────────────────────── */}
      {error && !loading && (
        <div style={{
          background: dark ? 'rgba(239,68,68,0.1)' : '#fff1f0',
          border: `1px solid ${dark ? 'rgba(239,68,68,0.25)' : '#ffd6d6'}`,
          borderRadius: 14, padding: '32px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <WifiOffRoundedIcon style={{ fontSize: 40, color: '#ef4444', opacity: 0.7 }} />
          <p style={{ margin: 0, fontWeight: 700, color: '#ef4444', fontSize: '1rem' }}>
            {lang === 'uz' ? "Ma'lumot yuklanmadi" : "Не удалось загрузить данные"}
          </p>
          <p style={{ margin: 0, color: textSub, fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>
          <button onClick={fetchGroups} style={{
            marginTop: 4, padding: '9px 22px', borderRadius: 10, cursor: 'pointer',
            background: '#ef4444', color: '#fff', border: 'none',
            fontWeight: 700, fontSize: '0.85rem', transition: 'opacity 0.2s',
          }}>
            {lang === 'uz' ? "Qayta urinish" : "Попробовать снова"}
          </button>
        </div>
      )}

      {/* ── Loading skeletons ─────────────────────────────────────────── */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} dark={dark} />)}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{
          background: cardBg, border: `1px solid ${border}`,
          borderRadius: 16, padding: '56px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: dark ? 'rgba(20,184,166,0.1)' : 'rgba(20,184,166,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <InboxRoundedIcon style={{ fontSize: 34, color: '#14b8a6', opacity: 0.7 }} />
          </div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: textMain }}>
            {activeTab === 'ALL'
              ? (lang === 'uz' ? "Hozircha guruhlar yo'q" : "Групп пока нет")
              : (lang === 'uz' ? "Bu toifada guruh yo'q" : "Нет групп в этой категории")}
          </p>
          <p style={{ margin: 0, color: textSub, fontSize: '0.85rem', textAlign: 'center', maxWidth: 340 }}>
            {lang === 'uz'
              ? "Sizga biriktirilgan guruhlar bu yerda ko'rinadi"
              : "Здесь будут отображаться прикреплённые к вам группы"}
          </p>
        </div>
      )}

      {/* ── Groups grid ───────────────────────────────────────────────── */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(group => {
            const id           = group.id;
            const name         = group.name || '—';
            const courseName   = group.course?.name || '—';
            const courseDur    = group.course?.duration_month;
            const room         = typeof group.room === 'string' ? group.room : (group.room?.name || '—');
            const studentCount = group.student_count ?? group.students?.length ?? 0;
            const status       = group.status || '';
            const startTime    = group.start_time ? group.start_time.slice(0, 5) : '—';
            const weekDay      = group.week_day
              ? (lang === 'uz' ? (WEEKDAYS_UZ[group.week_day] || group.week_day) : (WEEKDAYS_RU[group.week_day] || group.week_day))
              : '—';

            const st = statusStyle(status, dark);

            return (
              <div
                key={id}
                onClick={() => navigate(`/teacher/groups/${id}`)}
                style={{
                  background: cardBg, border: `1px solid ${border}`,
                  borderRadius: 16, padding: '20px 22px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = '#14b8a6';
                  e.currentTarget.style.transform   = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow   = '0 8px 28px rgba(20,184,166,0.15)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = border;
                  e.currentTarget.style.transform   = 'translateY(0)';
                  e.currentTarget.style.boxShadow   = 'none';
                }}
              >
                {/* Teal accent line on top */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: 'linear-gradient(90deg, #14b8a6, #06b6d4)',
                  borderRadius: '16px 16px 0 0',
                }} />

                {/* Row 1: Name + Status */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, paddingTop: 4 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: textMain, lineHeight: 1.3 }}>
                    {name}
                  </h3>
                  <span style={{
                    flexShrink: 0, padding: '3px 10px', borderRadius: 20,
                    fontSize: '0.75rem', fontWeight: 700,
                    background: st.bg, color: st.text,
                  }}>
                    {statusLabel(status, lang)}
                  </span>
                </div>

                {/* Row 2: Course */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <SchoolRoundedIcon style={{ fontSize: 16, color: '#14b8a6', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.87rem', color: textSub, fontWeight: 500 }}>
                    {courseName}
                    {courseDur && (
                      <span style={{ marginLeft: 6, fontSize: '0.78rem', color: dark ? '#444460' : '#cbd5e1' }}>
                        ({courseDur} {lang === 'uz' ? 'oy' : 'мес.'})
                      </span>
                    )}
                  </span>
                </div>

                {/* Row 3: Meta info */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  {/* Students */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: dark ? 'rgba(20,184,166,0.12)' : 'rgba(20,184,166,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <PeopleRoundedIcon style={{ fontSize: 15, color: '#14b8a6' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: textMain }}>{studentCount}</span>
                      <span style={{ fontSize: '0.75rem', color: textSub, marginLeft: 4 }}>
                        {lang === 'uz' ? "talaba" : "уч."}
                      </span>
                    </div>
                  </div>

                  {/* Room */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: dark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <MeetingRoomRoundedIcon style={{ fontSize: 15, color: '#6366f1' }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: textSub, fontWeight: 500 }}>{room}</span>
                  </div>

                  {/* Schedule */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: dark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CalendarMonthRoundedIcon style={{ fontSize: 15, color: '#f59e0b' }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: textSub, fontWeight: 500 }}>
                      {weekDay} · {startTime}
                    </span>
                  </div>
                </div>

                {/* Row 4: Open button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '7px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                    color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(20,184,166,0.28)',
                    transition: 'box-shadow 0.2s',
                  }}>
                    {lang === 'uz' ? "Ko'rish" : "Открыть"}
                    <ChevronRightRoundedIcon style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
