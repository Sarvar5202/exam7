import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import Skeleton from '@mui/material/Skeleton';
import { getMyGroups } from '../../api/studentApi';

export default function StudentPayments() {
  const { dark, lang } = useApp();

  const cardBg   = dark ? '#111118' : '#ffffff';
  const border   = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub  = dark ? '#8888aa' : '#64748b';

  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res  = await getMyGroups();
        const data = res.data?.data || res.data || [];
        setGroups(Array.isArray(data) ? data : []);
      } catch {
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Guruh narxlaridan umumiy hisoblash
  const totalGroups = groups.length;

  const statsCards = [
    {
      icon: <GroupRoundedIcon />,
      label: lang === 'uz' ? 'Faol guruhlar' : 'Активных групп',
      value: loading ? '—' : String(totalGroups),
      color: '#3b82f6',
      bg: dark ? 'rgba(59,130,246,0.15)' : '#eff6ff',
    },
    {
      icon: <AccountBalanceWalletRoundedIcon />,
      label: lang === 'uz' ? "To'lov holati" : 'Статус оплаты',
      value: lang === 'uz' ? "Aniqlash uchun adminga murojaat qiling" : "Уточните у администратора",
      color: '#22c55e',
      bg: dark ? 'rgba(34,197,94,0.15)' : '#f0fdf4',
      small: true,
    },
    {
      icon: <PaymentRoundedIcon />,
      label: lang === 'uz' ? "To'lov usuli" : 'Способ оплаты',
      value: lang === 'uz' ? 'Naqd / Karta' : 'Наличные / Карта',
      color: '#f97316',
      bg: dark ? 'rgba(249,115,22,0.15)' : '#fff7ed',
    },
  ];

  return (
    <div className="pt-6 flex flex-col gap-6">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: textMain, margin: 0 }}>
        {lang === 'uz' ? "To'lovlarim" : 'Мои оплаты'}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsCards.map((s, i) => (
          <div key={i} style={{
            background: cardBg, borderRadius: 16, padding: '20px',
            border: `1px solid ${border}`, transition: 'all 0.2s',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color, marginBottom: 12,
            }}>
              {s.icon}
            </div>
            <p style={{ fontSize: '0.82rem', color: textSub, marginBottom: 4 }}>{s.label}</p>
            {loading && i === 0
              ? <Skeleton variant="text" width={40} height={36} />
              : <h2 style={{ fontSize: s.small ? '0.85rem' : '1.2rem', fontWeight: 800, color: textMain, margin: 0 }}>{s.value}</h2>
            }
          </div>
        ))}
      </div>

      {/* Guruhlar jadvali */}
      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${border}` }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: textMain, margin: 0 }}>
            {lang === 'uz' ? "Mening guruhlarim" : 'Мои группы'}
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${border}` }}>
                {[
                  '#',
                  lang === 'uz' ? 'Guruh nomi' : 'Группа',
                  lang === 'uz' ? "Yo'nalish" : 'Курс',
                  lang === 'uz' ? "O'qituvchi" : 'Учитель',
                  lang === 'uz' ? 'Holat' : 'Статус',
                ].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', padding: '12px 20px', fontWeight: 700, color: textMain, fontSize: '0.82rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5].map(j => (
                      <td key={j} style={{ padding: '14px 20px' }}>
                        <Skeleton variant="text" width={j === 2 ? 100 : 70} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{
                    padding: '48px 20px', textAlign: 'center', color: textSub, fontSize: '0.9rem',
                  }}>
                    <ReceiptLongRoundedIcon style={{ fontSize: 40, display: 'block', margin: '0 auto 10px', color: textSub }} />
                    {lang === 'uz' ? "Guruh topilmadi" : "Группы не найдены"}
                  </td>
                </tr>
              ) : groups.map((item, idx) => {
                const group = item?.group || item;
                const gName = group?.groupName || group?.name || '—';
                const gCourse = group?.courseName || group?.course?.name || '—';
                const gTeacher = group?.teachers?.[0]?.full_name || group?.teacher?.full_name || group?.teacher_name || '—';

                return (
                  <tr key={idx}
                    style={{ borderBottom: `1px solid ${border}` }}
                    onMouseOver={e => e.currentTarget.style.background = dark ? '#16161f' : '#fafbfc'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px', color: textMain }}>{idx + 1}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: textMain }}>
                      {gName}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600,
                        background: dark ? 'rgba(108,53,222,0.2)' : '#f3f0ff', color: '#6c35de',
                      }}>
                        {gCourse}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: textMain }}>
                      {gTeacher}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                        background: dark ? 'rgba(34,197,94,0.15)' : '#f0fdf4',
                        color: '#22c55e',
                      }}>
                        {lang === 'uz' ? 'Faol' : 'Активна'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Izoh */}
      <div style={{
        padding: '16px 20px', borderRadius: 14,
        background: dark ? 'rgba(59,130,246,0.08)' : '#eff6ff',
        border: `1px solid ${dark ? 'rgba(59,130,246,0.2)' : '#bfdbfe'}`,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <PaymentRoundedIcon style={{ color: '#3b82f6', fontSize: 20, marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontSize: '0.83rem', color: dark ? '#93c5fd' : '#1d4ed8', margin: 0, lineHeight: 1.6 }}>
          {lang === 'uz'
            ? "To'lov tarixi va qarz ma'lumotlari uchun Najot Ta'lim administratsiyasiga murojaat qiling."
            : "По вопросам истории оплат и задолженностей обратитесь в администрацию Najot Ta'lim."}
        </p>
      </div>
    </div>
  );
}
