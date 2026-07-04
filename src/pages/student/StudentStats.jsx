import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import Skeleton from '@mui/material/Skeleton';
import { getMyGroups, getMyGroupLessons, getLessonHomeworks, getOwnHomework } from '../../api/studentApi';

export default function StudentStats() {
  const { dark, lang } = useApp();

  const cardBg   = dark ? '#111118' : '#ffffff';
  const border   = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub  = dark ? '#8888aa' : '#64748b';

  const [loading, setLoading]     = useState(true);
  const [lessons, setLessons]     = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [groups, setGroups]       = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Guruhlarni olish
        const grRes  = await getMyGroups();
        const grData = grRes.data?.data || grRes.data || [];
        const grArr  = Array.isArray(grData) ? grData : [];
        setGroups(grArr);

        // Birinchi guruh darslarini olish
        if (grArr.length > 0) {
          const groupId = grArr[0]?.groupId || grArr[0]?.id || grArr[0]?.group?.id;
          if (groupId) {
            const lRes  = await getMyGroupLessons(groupId);
            const lData = lRes.data?.data || lRes.data || [];
            const lArr  = Array.isArray(lData) ? lData : [];
            setLessons(lArr);

            // Har bir dars uchun o'z uyga vazifalarini olish
            const hwPromises = lArr.slice(0, 8).map(async (lesson) => {
              const lid = lesson?.id;
              if (!lid) return null;
              try {
                const hwRes = await getOwnHomework(lid);
                const hw = hwRes.data?.data || hwRes.data;
                if (!hw) return null;

                const resultObj = hw?.result;
                const answerObj = hw?.answer;

                let finalStatus = 'pending';
                if (resultObj?.status) {
                  finalStatus = String(resultObj.status).toLowerCase();
                } else if (hw?.status) {
                  finalStatus = String(hw.status).toLowerCase();
                } else if (answerObj || hw?.file || hw?.link) {
                  finalStatus = 'pending';
                }

                return {
                  id: lid,
                  topic: lesson?.topic || lesson?.title || lesson?.name || `Dars ${lid}`,
                  status: finalStatus,
                  ball: resultObj?.grade ?? resultObj?.ball ?? resultObj?.score ?? hw?.grade ?? hw?.ball ?? hw?.score ?? null,
                  date: lesson?.created_at?.slice(0, 10) || lesson?.date || '',
                };
              } catch {
                return null;
              }
            });
            const hwResults = (await Promise.all(hwPromises)).filter(Boolean);
            setHomeworks(hwResults);
          }
        }
      } catch {
        setGroups([]);
        setLessons([]);
        setHomeworks([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Hisob-kitoblar
  const accepted = homeworks.filter(h => h.status === 'accepted' || h.status === 'ACCEPTED').length;
  const rejected = homeworks.filter(h => h.status === 'rejected' || h.status === 'REJECTED').length;
  const pending  = homeworks.filter(h => h.status === 'pending'  || h.status === 'PENDING').length;
  const avgBall  = (() => {
    const balls = homeworks.filter(h => h.ball != null).map(h => h.ball);
    return balls.length ? Math.round(balls.reduce((a, b) => a + b, 0) / balls.length) : '—';
  })();

  const statsData = [
    {
      icon: <CheckCircleRoundedIcon />,
      label: lang === 'uz' ? "Qabul qilingan" : 'Принятые задания',
      value: loading ? '—' : String(accepted),
      color: '#22c55e',
      bg: dark ? 'rgba(34,197,94,0.15)' : '#f0fdf4',
    },
    {
      icon: <TrendingUpRoundedIcon />,
      label: lang === 'uz' ? "O'rtacha ball" : 'Средний балл',
      value: loading ? '—' : String(avgBall),
      color: '#3b82f6',
      bg: dark ? 'rgba(59,130,246,0.15)' : '#eff6ff',
    },
    {
      icon: <AccessTimeRoundedIcon />,
      label: lang === 'uz' ? 'Jami darslar' : 'Всего уроков',
      value: loading ? '—' : String(lessons.length),
      color: '#6c35de',
      bg: dark ? 'rgba(108,53,222,0.15)' : '#f3f0ff',
    },
    {
      icon: <CancelRoundedIcon />,
      label: lang === 'uz' ? "Qaytarilgan" : 'Отклонённые',
      value: loading ? '—' : String(rejected),
      color: '#ef4444',
      bg: dark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
    },
  ];

  const statusMap = {
    accepted:  { bg: dark ? 'rgba(34,197,94,0.15)'  : '#f0fdf4', color: '#22c55e', text: lang === 'uz' ? 'Qabul qilindi' : 'Принято' },
    ACCEPTED:  { bg: dark ? 'rgba(34,197,94,0.15)'  : '#f0fdf4', color: '#22c55e', text: lang === 'uz' ? 'Qabul qilindi' : 'Принято' },
    pending:   { bg: dark ? 'rgba(249,115,22,0.15)' : '#fff7ed', color: '#f97316', text: lang === 'uz' ? 'Kutilmoqda'   : 'Ожидание' },
    PENDING:   { bg: dark ? 'rgba(249,115,22,0.15)' : '#fff7ed', color: '#f97316', text: lang === 'uz' ? 'Kutilmoqda'   : 'Ожидание' },
    rejected:  { bg: dark ? 'rgba(239,68,68,0.15)'  : '#fef2f2', color: '#ef4444', text: lang === 'uz' ? 'Qaytarildi'   : 'Отклонено' },
    REJECTED:  { bg: dark ? 'rgba(239,68,68,0.15)'  : '#fef2f2', color: '#ef4444', text: lang === 'uz' ? 'Qaytarildi'   : 'Отклонено' },
    checked:   { bg: dark ? 'rgba(59,130,246,0.15)' : '#eff6ff', color: '#3b82f6', text: lang === 'uz' ? 'Tekshirildi'  : 'Проверено' },
    CHECKED:   { bg: dark ? 'rgba(59,130,246,0.15)' : '#eff6ff', color: '#3b82f6', text: lang === 'uz' ? 'Tekshirildi'  : 'Проверено' },
  };

  return (
    <div className="pt-6 flex flex-col gap-6">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: textMain, margin: 0 }}>
        {lang === 'uz' ? "Ko'rsatkichlarim" : 'Мои показатели'}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((s, i) => (
          <div key={i} style={{
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
            }}>{s.icon}</div>
            <p style={{ fontSize: '0.82rem', color: textSub, marginBottom: 4 }}>{s.label}</p>
            {loading
              ? <Skeleton variant="text" width={60} height={36} />
              : <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: textMain, margin: 0 }}>{s.value}</h2>
            }
          </div>
        ))}
      </div>

      {/* Homework results */}
      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AssignmentRoundedIcon style={{ color: '#6c35de' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: textMain, margin: 0 }}>
            {lang === 'uz' ? 'Uyga vazifalar' : 'Домашние задания'}
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${border}` }}>
                {['#', lang === 'uz' ? 'Mavzu' : 'Тема', lang === 'uz' ? 'Sana' : 'Дата', lang === 'uz' ? 'Ball' : 'Балл', lang === 'uz' ? 'Holat' : 'Статус'].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', padding: '12px 20px', fontWeight: 700, color: textMain, fontSize: '0.82rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5].map(j => (
                      <td key={j} style={{ padding: '12px 20px' }}>
                        <Skeleton variant="text" width={j === 2 ? 120 : 60} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : homeworks.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: textSub }}>
                    {lang === 'uz' ? "Uyga vazifalar topilmadi" : "Домашних заданий не найдено"}
                  </td>
                </tr>
              ) : homeworks.map((h, idx) => {
                const st = statusMap[h.status] || statusMap['pending'];
                return (
                  <tr key={h.id} style={{ borderBottom: `1px solid ${border}` }}
                    onMouseOver={e => e.currentTarget.style.background = dark ? '#16161f' : '#fafbfc'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 20px', color: textMain }}>{idx + 1}</td>
                    <td style={{ padding: '12px 20px', color: textMain, fontWeight: 600 }}>{h.topic}</td>
                    <td style={{ padding: '12px 20px', color: textSub }}>{h.date}</td>
                    <td style={{ padding: '12px 20px', color: textMain, fontWeight: 700 }}>{h.ball ?? '—'}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                        background: st.bg, color: st.color,
                      }}>{st.text}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
