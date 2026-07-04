import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import Skeleton from '@mui/material/Skeleton';
import { getMyGroups, getGroupById } from '../../api/studentApi';

export default function StudentGroups() {
  const { dark, lang } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [groups, setGroups]       = useState([]);
  const [loading, setLoading]     = useState(true);

  const cardBg   = dark ? '#111118' : '#ffffff';
  const border   = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub  = dark ? '#8888aa' : '#64748b';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res  = await getMyGroups();
        const data = res.data?.data || res.data || [];
        const baseGroups = Array.isArray(data) ? data : [];

        setGroups(baseGroups);
      } catch {
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleGroupClick(groupObj) {
    const groupId = groupObj?.groupId || groupObj?.id;
    if (groupId) {
      navigate(`/student/groups/${groupId}`);
    }
  }

  return (
    <div className="pt-6 flex flex-col gap-5">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${border}` }}>
        {['active', 'finished'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 24px',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? '#f97316' : textSub,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #f97316' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: -2,
            }}
          >
            {tab === 'active'
              ? (lang === 'uz' ? 'Faol guruhlar' : 'Активные группы')
              : (lang === 'uz' ? 'Tugagan guruhlar' : 'Завершённые')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: cardBg, borderRadius: 16,
        border: `1px solid ${border}`, overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${border}` }}>
                {['#', lang === 'uz' ? 'Guruh nomi' : 'Название', lang === 'uz' ? "Yo'nalishi" : 'Курс', lang === 'uz' ? "O'qituvchi" : 'Учитель', lang === 'uz' ? 'Xona' : 'Комната'].map((h, i) => (
                  <th key={i} style={{
                    textAlign: 'left', padding: '14px 20px', fontWeight: 700,
                    color: textMain, fontSize: '0.85rem',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5].map(j => (
                      <td key={j} style={{ padding: '14px 20px' }}>
                        <Skeleton variant="text" width={j === 1 ? 24 : 80} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{
                    padding: '60px 20px', textAlign: 'center',
                    color: textSub, fontSize: '0.9rem',
                  }}>
                    {lang === 'uz' ? "Ma'lumot mavjud emas" : 'Данные отсутствуют'}
                  </td>
                </tr>
              ) : groups.map((item, idx) => {
                const group = item?.group || item;
                const groupId = group?.groupId || group?.id;

                const gName = group?.groupName || group?.name || '—';
                const gCourse = group?.courseName || group?.course?.name || '—';
                const gTeacher = group?.teachers?.[0]?.full_name || group?.teacher?.full_name || group?.teacher_name || '—';
                const gRoom = group?.room?.name || '—';

                return (
                  <tr
                    key={groupId}
                    style={{
                      borderBottom: `1px solid ${border}`,
                      transition: 'background 0.15s',
                      cursor: 'pointer',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = dark ? '#16161f' : '#fafbfc'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => handleGroupClick(group)}
                  >
                    <td style={{ padding: '14px 20px', color: textMain, fontWeight: 500 }}>{idx + 1}</td>
                    <td style={{ padding: '14px 20px', color: textMain, fontWeight: 600 }}>
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
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'linear-gradient(135deg,#6c35de,#9b6dff)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                        }}>
                          <PersonRoundedIcon style={{ fontSize: 16 }} />
                        </div>
                        <span style={{ color: textMain, fontSize: '0.85rem' }}>
                          {gTeacher}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: textSub }}>
                      {gRoom}
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
