import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { useApp } from '../../context/AppContext';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';

export default function TeacherHomework() {
  const { dark, lang } = useApp();
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);

  const bg = dark ? '#0a0a0f' : '#eef0f5';
  const cardBg = dark ? '#111118' : '#ffffff';
  const border = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub = dark ? '#7070a0' : '#64748b';

  useEffect(() => {
    async function fetchAllHomeworks() {
      setLoading(true);
      try {
        // 1. Fetch all groups for this teacher
        const resGroups = await api.get('/teachers/my/groups');
        const groups = Array.isArray(resGroups.data?.data ?? resGroups.data) 
          ? (resGroups.data?.data ?? resGroups.data) : [];

        // 2. Fetch homeworks for each group
        const hwPromises = groups.map(g => 
          api.get(`/homework/${g.id}`).then(r => ({
            group: g,
            homeworks: Array.isArray(r.data?.data ?? r.data) ? (r.data?.data ?? r.data) : []
          })).catch(() => ({ group: g, homeworks: [] }))
        );

        const hwResults = await Promise.all(hwPromises);
        
        // 3. Flatten into a single array
        let allHw = [];
        for (const res of hwResults) {
          for (const hw of res.homeworks) {
            // hw has { id: lessonId, topic, homework: [{id, file, title}], homeworkAccept, homeworkReject, homeworkPending }
            allHw.push({
              ...hw,
              group: res.group
            });
          }
        }
        
        // Sort by id or created_at (assume newer id is newer)
        allHw.sort((a, b) => b.id - a.id);
        setHomeworks(allHw);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllHomeworks();
  }, []);

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(20,184,166,0.3)',
        }}>
          <AssignmentRoundedIcon style={{ color: '#fff', fontSize: 24 }} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: textMain, margin: 0 }}>
            {lang === 'uz' ? "Uyga vazifalar" : "Домашние задания"}
          </h1>
          {!loading && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: textSub }}>
              {lang === 'uz' ? `Jami ${homeworks.length} ta dars vazifalari` : `Всего ${homeworks.length} заданий`}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <CircularProgress style={{ color: '#14b8a6' }} />
        </div>
      ) : homeworks.length === 0 ? (
        <div style={{ background: cardBg, padding: 40, textAlign: 'center', borderRadius: 16, border: `1px solid ${border}` }}>
          <p style={{ color: textSub, fontSize: '0.95rem' }}>
            {lang === 'uz' ? "Vazifalar topilmadi" : "Задания не найдены"}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {homeworks.map((item, idx) => {
            const hwId = item.homework?.[0]?.id; // birinchi fayl IDsi
            const acc = item.homeworkAccept || 0;
            const rej = item.homeworkReject || 0;
            const pend = item.homeworkPending || 0;
            const total = acc + rej + pend;

            return (
              <div key={`${item.id}-${idx}`} style={{
                background: cardBg, borderRadius: 16, border: `1px solid ${border}`,
                padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onClick={() => {
                if (hwId) navigate(`/teacher/groups/${item.group.id}/homework/${hwId}/check`);
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'none'}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: textMain, fontWeight: 700 }}>
                      {item.topic || 'Mavzusiz dars'}
                    </h3>
                    <span style={{ 
                      background: 'rgba(20,184,166,0.1)', color: '#0d9488', 
                      padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600
                    }}>
                      Guruh: {item.group.name || `#${item.group.id}`}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: textSub }}>
                    {item.homework?.[0]?.title || (lang === 'uz' ? "Vazifa biriktirilgan" : "Задание прикреплено")}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ background: dark ? '#1a1a28' : '#f8fafc', padding: '6px 12px', borderRadius: 8, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: textSub }}>{lang === 'uz' ? 'Qabul' : 'Принято'}</p>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#22c55e' }}>{acc}</p>
                  </div>
                  <div style={{ background: dark ? '#1a1a28' : '#f8fafc', padding: '6px 12px', borderRadius: 8, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: textSub }}>{lang === 'uz' ? 'Rad' : 'Отклонено'}</p>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>{rej}</p>
                  </div>
                  <div style={{ background: dark ? '#1a1a28' : '#f8fafc', padding: '6px 12px', borderRadius: 8, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: textSub }}>{lang === 'uz' ? 'Kutilmoqda' : 'В ожидании'}</p>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>{pend}</p>
                  </div>
                </div>

                {total === 0 && (
                  <p style={{ margin: 0, fontSize: '0.8rem', color: textSub, fontStyle: 'italic' }}>
                    {lang === 'uz' ? "Hech kim javob topshirmagan" : "Никто не отправил ответ"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
