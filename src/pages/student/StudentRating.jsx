import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import Skeleton from '@mui/material/Skeleton';
import { getMyGroups, getGroupStudents } from '../../api/studentApi';

export default function StudentRating() {
  const { dark, lang } = useApp();

  const cardBg   = dark ? '#111118' : '#ffffff';
  const border   = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub  = dark ? '#8888aa' : '#64748b';

  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [myId, setMyId]         = useState(null);

  // Joriy student ID
  const studentUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('studentUser')) || {}; }
    catch { return {}; }
  })();

  useEffect(() => {
    setMyId(studentUser?.id || null);
    async function load() {
      setLoading(true);
      try {
        // Guruhlarni olish
        const grRes  = await getMyGroups();
        const grData = grRes.data?.data || grRes.data || [];
        const grArr  = Array.isArray(grData) ? grData : [];

        if (grArr.length > 0) {
          const group     = grArr[0]?.group || grArr[0];
          const groupId   = group?.groupId || group?.id;

          if (groupId) {
            // Guruh studentlarini olish
            const stRes  = await getGroupStudents(groupId);
            const stData = stRes.data?.data || stRes.data || [];
            const stArr  = Array.isArray(stData) ? stData : [];

            // Studentlarni coin/ball bo'yicha tartiblash
            const sorted = [...stArr].sort((a, b) => {
              const ba = a?.coin ?? a?.ball ?? a?.points ?? 0;
              const bb = b?.coin ?? b?.ball ?? b?.points ?? 0;
              return bb - ba;
            });
            setStudents(sorted);
          }
        }
      } catch {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  // O'zining o'rni
  const myRank = students.findIndex(s => s?.id === myId || s?.student?.id === myId) + 1;

  return (
    <div className="pt-6 flex flex-col gap-6">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: textMain, margin: 0 }}>
          {lang === 'uz' ? 'Reyting' : 'Рейтинг'}
        </h1>
        {!loading && myRank > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            background: dark ? 'rgba(249,115,22,0.15)' : '#fff7ed',
            borderRadius: 12, border: `1px solid ${dark ? 'rgba(249,115,22,0.3)' : '#fed7aa'}`,
          }}>
            <TrendingUpRoundedIcon style={{ color: '#f97316', fontSize: 20 }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f97316' }}>
              {lang === 'uz' ? `Sizning o'rningiz: #${myRank}` : `Ваше место: #${myRank}`}
            </span>
          </div>
        )}
      </div>

      {/* Top 3 */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} variant="rounded" height={200} sx={{ borderRadius: 2 }} />
          ))}
        </div>
      ) : students.length >= 3 ? (
        <div className="grid grid-cols-3 gap-4">
          {students.slice(0, 3).map((item, i) => {
            const s      = item?.student || item;
            const points = item?.coin ?? item?.ball ?? item?.points ?? 0;
            const name   = s?.full_name || s?.name || `Student ${i + 1}`;
            const isMe   = s?.id === myId;
            return (
              <div key={i} style={{
                background: isMe ? (dark ? 'rgba(108,53,222,0.12)' : '#f9f5ff') : cardBg,
                borderRadius: 16, padding: '24px 16px',
                border: `1.5px solid ${isMe ? '#6c35de' : border}`,
                textAlign: 'center', position: 'relative', transition: 'all 0.2s',
              }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', margin: '0 auto 12px',
                  background: `linear-gradient(135deg, ${medalColors[i]}, ${medalColors[i]}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '1.2rem',
                  boxShadow: `0 4px 12px ${medalColors[i]}44`,
                }}>
                  {i + 1}
                </div>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', margin: '0 auto 10px',
                  background: dark ? '#1a1a28' : '#f3f0ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${medalColors[i]}`,
                }}>
                  <EmojiEventsRoundedIcon style={{ color: medalColors[i], fontSize: 24 }} />
                </div>
                <p style={{ fontWeight: 700, color: isMe ? '#6c35de' : textMain, fontSize: '0.9rem', margin: 0 }}>
                  {name}
                </p>
                {isMe && (
                  <span style={{ fontSize: '0.68rem', color: '#6c35de', fontWeight: 600 }}>
                    {lang === 'uz' ? '(Siz)' : '(Вы)'}
                  </span>
                )}
                <p style={{ fontWeight: 800, color: '#f97316', fontSize: '1.1rem', margin: '6px 0 0' }}>
                  {points} {lang === 'uz' ? 'coin' : 'коин'}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* To'liq jadval */}
      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <PersonRoundedIcon style={{ color: '#6c35de' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: textMain, margin: 0 }}>
            {lang === 'uz' ? 'Guruh reytingi' : 'Рейтинг группы'}
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${border}` }}>
                {['#', lang === 'uz' ? 'Ism Familiya' : 'Имя', lang === 'uz' ? 'Coin' : 'Коин'].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 700, color: textMain }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    {[1, 2, 3].map(j => (
                      <td key={j} style={{ padding: '12px 20px' }}>
                        <Skeleton variant="text" width={j === 2 ? 140 : 60} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '48px 20px', textAlign: 'center', color: textSub }}>
                    {lang === 'uz' ? "Ma'lumot topilmadi" : "Данные не найдены"}
                  </td>
                </tr>
              ) : students.map((item, idx) => {
                const s      = item?.student || item;
                const points = item?.coin ?? item?.ball ?? item?.points ?? 0;
                const name   = s?.full_name || s?.name || `Student ${idx + 1}`;
                const isMe   = s?.id === myId;
                const rank   = idx + 1;
                return (
                  <tr key={idx} style={{
                    borderBottom: `1px solid ${border}`,
                    background: isMe ? (dark ? 'rgba(108,53,222,0.1)' : '#f9f5ff') : 'transparent',
                  }}
                    onMouseOver={e => { if (!isMe) e.currentTarget.style.background = dark ? '#16161f' : '#fafbfc'; }}
                    onMouseOut={e => { if (!isMe) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{
                      padding: '12px 20px', fontWeight: 700,
                      color: rank <= 3 ? medalColors[rank - 1] : textMain,
                    }}>
                      {rank <= 3 ? '🏆'.slice(0, 0) + rank : rank}
                      {rank === 1 ? ' 🥇' : rank === 2 ? ' 🥈' : rank === 3 ? ' 🥉' : ''}
                    </td>
                    <td style={{
                      padding: '12px 20px',
                      fontWeight: isMe ? 700 : 500,
                      color: isMe ? '#6c35de' : textMain,
                    }}>
                      {name}
                      {isMe && <span style={{ fontSize: '0.72rem', color: '#6c35de', marginLeft: 6 }}>
                        {lang === 'uz' ? '(Siz)' : '(Вы)'}
                      </span>}
                    </td>
                    <td style={{ padding: '12px 20px', fontWeight: 700, color: '#f97316' }}>
                      {points}
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
