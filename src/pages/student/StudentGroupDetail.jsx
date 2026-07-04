import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import { getMyGroupLessons, getLessonHomeworks } from '../../api/studentApi';

export default function StudentGroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dark } = useApp();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Barchasi');
  const [homeworkMap, setHomeworkMap] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getMyGroupLessons(id);
        const data = res.data?.data || res.data || [];
        const lessonsArr = Array.isArray(data) ? data : [];
        setLessons(lessonsArr);

        // Har bir dars uchun real homework ma'lumotini olish
        const hwMap = {};
        const parseHwEntry = (entry) => {
          const homework = entry?.homework || null;
          const answer = entry?.answer || null;
          const result = entry?.result || null;
          if (!homework) return { hasHomework: false, status: 'Berilmagan', deadline: null, grade: null };
          let status = 'Topshirilmagan';
          if (result?.status) {
            const s = result.status;
            if (s === 'ACCEPTED') status = 'Qabul qilingan';
            else if (s === 'REJECTED') status = 'Qaytarilgan';
            else if (s === 'CHECKED') status = 'Tekshirilgan';
            else if (s === 'PENDING') status = 'Kutayotganlar';
          } else if (answer) {
            status = 'Kutayotganlar';
          }
          return {
            hasHomework: true,
            status,
            deadline: homework.deadline || homework.end_date || homework.due_date || null,
            grade: result?.grade ?? null,
          };
        };

        await Promise.all(
          lessonsArr.map(async (lesson) => {
            const lid = lesson?.id;
            if (!lid) return;
            try {
              const hwRes = await getLessonHomeworks(id, lid);
              const hwData = hwRes.data?.data || hwRes.data;
              if (hwData && typeof hwData === 'object' && !Array.isArray(hwData)) {
                hwMap[lid] = parseHwEntry(hwData);
              } else if (Array.isArray(hwData) && hwData.length > 0) {
                hwMap[lid] = parseHwEntry(hwData[0]);
              } else {
                hwMap[lid] = { hasHomework: false, status: 'Berilmagan', deadline: null, grade: null };
              }
            } catch {
              hwMap[lid] = { hasHomework: false, status: 'Berilmagan', deadline: null, grade: null };
            }
          })
        );
        setHomeworkMap(hwMap);
      } catch {
        setLessons([]);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const bg = dark ? '#111118' : '#ffffff';
  const border = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub = dark ? '#8888aa' : '#64748b';

  const formatDateTime = (s) => {
    if (!s) return '-';
    try {
      const dd = new Date(s);
      if (isNaN(dd.getTime())) return '-';
      const months = ['Yan', 'Fev', 'Mart', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sent', 'Okt', 'Noy', 'Dek'];
      return `${dd.getDate()} ${months[dd.getMonth()]}, ${dd.getFullYear()} ${String(dd.getHours()).padStart(2, '0')}:${String(dd.getMinutes()).padStart(2, '0')}`;
    } catch { return '-'; }
  };

  // Statusga qarab darslarni filtrlash
  const STATUS_COLORS = {
    'Qabul qilingan': '#22c55e',
    'Qaytarilgan': '#ef4444',
    'Kutayotganlar': '#6c85ff',
    'Tekshirilgan': '#3b82f6',
    'Topshirilmagan': '#f59e0b',
    'Berilmagan': '#737373',
  };

  const filteredLessons = filter === 'Barchasi'
    ? lessons
    : lessons.filter(lesson => {
        const hw = homeworkMap[lesson?.id];
        if (!hw) return filter === 'Berilmagan';
        return hw.status === filter;
      });

  return (
    <div className="pt-6">
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: textSub }}>
          Uy vazifa statusi
        </label>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border outline-none text-sm w-56 font-medium"
          style={{ 
            background: bg, 
            borderColor: border, 
            color: textMain 
          }}
        >
          <option value="Barchasi">Barchasi</option>
          <option value="Kutayotganlar">Kutayotganlar</option>
          <option value="Qabul qilingan">Qabul qilingan</option>
          <option value="Qaytarilgan">Qaytarilgan</option>
          <option value="Tekshirilgan">Tekshirilgan</option>
          <option value="Topshirilmagan">Topshirilmagan</option>
          <option value="Berilmagan">Berilmagan</option>
        </select>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: bg, borderColor: border }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${border}` }}>
                <th className="px-6 py-4 font-bold whitespace-nowrap" style={{ color: textMain }}>Mavzular</th>
                <th className="px-6 py-4 font-bold whitespace-nowrap" style={{ color: textMain }}>Video</th>
                <th className="px-6 py-4 font-bold whitespace-nowrap" style={{ color: textMain }}>Uyga vazifa Holati</th>
                <th className="px-6 py-4 font-bold whitespace-nowrap flex items-center gap-2" style={{ color: textMain }}>
                  Uyga vazifa tugash vaqti
                  <ArrowDownwardRoundedIcon style={{ fontSize: 16, color: textSub }} />
                </th>
                <th className="px-6 py-4 font-bold whitespace-nowrap" style={{ color: textMain }}>
                  <div className="flex items-center gap-2">
                    Dars sanasi
                    <ArrowUpwardRoundedIcon style={{ fontSize: 16, color: '#22c55e' }} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center" style={{ color: textSub }}>
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredLessons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center" style={{ color: textSub }}>
                    Ma'lumot mavjud emas
                  </td>
                </tr>
              ) : (
                filteredLessons.map((lesson, idx) => {
                  const isExam = lesson.topic?.toLowerCase().includes('exam') || lesson.topic?.toLowerCase().includes('imtihon');
                  
                  const topic = lesson?.topic || lesson?.title || lesson?.name || `Mavzu ${idx + 1}`;
                  const videoNum = isExam ? 'Imtihon' : (idx % 2 === 0 ? '1' : '2');

                  // Real homework data from API
                  const hw = homeworkMap[lesson?.id] || { hasHomework: false, status: 'Berilmagan', deadline: null };
                  const hwStatus = hw.status;
                  const hwDeadline = hw.deadline ? formatDateTime(hw.deadline) : '-';
                  
                  let dDate = lesson?.created_at?.slice(0, 10) || lesson?.date || '';
                  if (dDate) {
                    try {
                      const dd = new Date(dDate);
                      const months = ['Yan', 'Fev', 'Mart', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sent', 'Okt', 'Noy', 'Dek'];
                      dDate = `${dd.getDate()} ${months[dd.getMonth()]}, ${dd.getFullYear()}`;
                    } catch(e) {}
                  }

                  return (
                    <tr 
                      key={lesson.id || idx} 
                      onClick={() => navigate(`/student/groups/${id}/lesson/${lesson.id || idx}`)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: idx === filteredLessons.length - 1 ? 'none' : `1px solid ${border}` }}
                      onMouseOver={e => e.currentTarget.style.background = dark ? '#16161f' : '#fafbfc'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-6 py-4 font-medium" style={{ color: textSub }}>
                        {topic}
                      </td>
                      <td className="px-6 py-4">
                        {isExam ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#d6a880', color: '#fff' }}>
                            Imtihon
                          </span>
                        ) : (
                          <div className="w-7 h-7 rounded-full border border-blue-400 text-blue-500 flex items-center justify-center text-xs font-semibold">
                            {videoNum}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ 
                          background: STATUS_COLORS[hwStatus] || '#737373', 
                          color: '#fff' 
                        }}>
                          {hwStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium" style={{ color: textSub }}>
                        {hwDeadline}
                      </td>
                      <td className="px-6 py-4 font-medium" style={{ color: textSub }}>
                        {dDate || '20 Iyun, 2026'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
