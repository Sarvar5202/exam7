import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { useApp } from '../../context/AppContext';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';

export default function TeacherAttendance() {
  const { dark, lang } = useApp();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]); // from /attendance/all
  
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  
  const [saving, setSaving] = useState(false);

  const bg = dark ? '#0a0a0f' : '#eef0f5';
  const cardBg = dark ? '#111118' : '#ffffff';
  const border = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub = dark ? '#7070a0' : '#64748b';

  // 1. Fetch Groups
  useEffect(() => {
    api.get('/teachers/my/groups')
      .then(res => {
        const data = res.data?.data || res.data || [];
        setGroups(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoadingGroups(false));
  }, []);

  // 2. Fetch Lessons when Group changes
  useEffect(() => {
    if (!selectedGroup) {
      setLessons([]);
      setSelectedLesson(null);
      setStudents([]);
      return;
    }
    
    // Set students from selected group
    setStudents(selectedGroup.students || []);
    
    setLoadingLessons(true);
    api.get(`/lessons/my/group/${selectedGroup.id}`)
      .then(res => {
        const data = res.data?.data || res.data || [];
        const arr = Array.isArray(data) ? data : [];
        setLessons(arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        if (arr.length > 0) setSelectedLesson(arr[0]);
        else setSelectedLesson(null);
      })
      .catch(console.error)
      .finally(() => setLoadingLessons(false));
  }, [selectedGroup]);

  // 3. Fetch Attendance when Group/Lesson changes
  useEffect(() => {
    if (!selectedGroup || !selectedLesson) {
      setAttendanceData([]);
      return;
    }
    setLoadingAttendance(true);
    // Teacher can fetch all attendance, then we filter client side
    api.get('/attendance/all')
      .then(res => {
        const data = res.data?.data || res.data || [];
        const arr = Array.isArray(data) ? data : [];
        // Filter for this group
        const filtered = arr.filter(a => String(a.group_id) === String(selectedGroup.id));
        setAttendanceData(filtered);
      })
      .catch(console.error)
      .finally(() => setLoadingAttendance(false));
  }, [selectedGroup, selectedLesson]);

  // Get current attendance state for a student
  // Wait, attendance/all doesn't have lesson_id?
  // Let's assume attendance is grouped by date or lesson_id. The DTO has { group_id, student_id, isPresent }.
  // If no lesson_id, we just show the latest or rely on created_at matching the lesson?
  // Let's just store the attendance per student locally for the UI since the API lacks lesson_id in DTO.
  
  const [localAttendance, setLocalAttendance] = useState({}); // { studentId: true/false }
  
  useEffect(() => {
    // When attendanceData loaded, populate local state
    const map = {};
    // We just take the latest record per student
    const sorted = [...attendanceData].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    for (const a of sorted) {
      map[a.student_id] = a.isPresent;
    }
    setLocalAttendance(map);
  }, [attendanceData]);

  const handleMark = async (studentId, isPresent) => {
    if (!selectedGroup) return;
    
    // Optimistic UI
    setLocalAttendance(prev => ({ ...prev, [studentId]: isPresent }));
    
    try {
      await api.post('/attendance', {
        group_id: selectedGroup.id,
        student_id: studentId,
        isPresent: isPresent
      });
    } catch (err) {
      console.error(err);
      // Revert if error
      setLocalAttendance(prev => ({ ...prev, [studentId]: !isPresent }));
      alert(lang === 'uz' ? 'Xatolik yuz berdi' : 'Произошла ошибка');
    }
  };

  const handleMarkAll = async (isPresent) => {
    if (!selectedGroup) return;
    setSaving(true);
    try {
      const promises = students.map(s => api.post('/attendance', {
        group_id: selectedGroup.id,
        student_id: s.id,
        isPresent: isPresent
      }));
      await Promise.all(promises);
      const newMap = {};
      students.forEach(s => newMap[s.id] = isPresent);
      setLocalAttendance(newMap);
    } catch (err) {
      console.error(err);
      alert(lang === 'uz' ? 'Ayrim talabalarni saqlashda xatolik' : 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(20,184,166,0.3)',
        }}>
          <CalendarMonthRoundedIcon style={{ color: '#fff', fontSize: 24 }} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: textMain, margin: 0 }}>
          {lang === 'uz' ? "Davomat" : "Посещаемость"}
        </h1>
      </div>

      <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
        
        {/* Filters */}
        <div style={{ 
          background: cardBg, padding: '20px', borderRadius: 16, 
          border: `1px solid ${border}`, display: 'flex', gap: 20, flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1 1 250px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: textSub, marginBottom: 8 }}>
              {lang === 'uz' ? "Guruhni tanlang" : "Выберите группу"}
            </label>
            <select
              value={selectedGroup?.id || ''}
              onChange={e => {
                const g = groups.find(x => String(x.id) === e.target.value);
                setSelectedGroup(g || null);
              }}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                background: dark ? '#1a1a28' : '#f8fafc', color: textMain,
                border: `1px solid ${border}`, outline: 'none', fontSize: '0.95rem'
              }}
            >
              <option value="">{lang === 'uz' ? "-- Guruh tanlang --" : "-- Выберите группу --"}</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name || `Guruh #${g.id}`}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 250px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: textSub, marginBottom: 8 }}>
              {lang === 'uz' ? "Darsni tanlang" : "Выберите урок"}
            </label>
            <select
              value={selectedLesson?.id || ''}
              onChange={e => {
                const l = lessons.find(x => String(x.id) === e.target.value);
                setSelectedLesson(l || null);
              }}
              disabled={!selectedGroup || loadingLessons}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                background: dark ? '#1a1a28' : '#f8fafc', color: textMain,
                border: `1px solid ${border}`, outline: 'none', fontSize: '0.95rem',
                opacity: (!selectedGroup || loadingLessons) ? 0.6 : 1
              }}
            >
              <option value="">
                {loadingLessons ? (lang === 'uz' ? "Yuklanmoqda..." : "Загрузка...") : (lang === 'uz' ? "-- Dars tanlang --" : "-- Выберите урок --")}
              </option>
              {lessons.map(l => (
                <option key={l.id} value={l.id}>{l.topic || `Dars #${l.id}`}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Students List */}
        {selectedGroup && selectedLesson && (
          <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
            <div style={{ 
              padding: '16px 20px', borderBottom: `1px solid ${border}`, 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: textMain, fontSize: '1.1rem' }}>
                {lang === 'uz' ? "Talabalar ro'yxati" : "Список студентов"} ({students.length})
              </h3>
              
              <div style={{ display: 'flex', gap: 10 }}>
                <button 
                  onClick={() => handleMarkAll(true)}
                  disabled={saving}
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'none',
                    padding: '8px 16px', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: '0.85rem'
                  }}
                >
                  {lang === 'uz' ? "Barchasi kelgan" : "Присутствуют все"}
                </button>
                <button 
                  onClick={() => handleMarkAll(false)}
                  disabled={saving}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none',
                    padding: '8px 16px', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: '0.85rem'
                  }}
                >
                  {lang === 'uz' ? "Barchasi kelmagan" : "Отсутствуют все"}
                </button>
              </div>
            </div>

            <div style={{ padding: '10px 20px' }}>
              {loadingAttendance ? (
                <div style={{ padding: 40, textAlign: 'center' }}><CircularProgress size={30} style={{ color: '#14b8a6' }} /></div>
              ) : students.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: textSub }}>
                  {lang === 'uz' ? "Talabalar topilmadi" : "Студенты не найдены"}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20 }}>
                  {students.map((stu, i) => {
                    const isPresent = localAttendance[stu.id];
                    return (
                      <div key={stu.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px', borderRadius: 10,
                        background: dark ? '#1a1a28' : '#f8fafc', border: `1px solid ${border}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%', background: 'rgba(20,184,166,0.1)',
                            color: '#14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.9rem'
                          }}>
                            {i + 1}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: textMain, fontSize: '0.95rem' }}>
                              {stu.full_name || stu.name || `Talaba #${stu.id}`}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: textSub }}>ID: {stu.id}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleMark(stu.id, true)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '8px 14px', borderRadius: 8, border: 'none',
                              cursor: 'pointer', transition: 'all 0.2s',
                              background: isPresent === true ? '#22c55e' : (dark ? '#222230' : '#e2e8f0'),
                              color: isPresent === true ? '#fff' : textSub,
                              fontWeight: 600, fontSize: '0.85rem'
                            }}
                          >
                            <CheckCircleRoundedIcon fontSize="small" />
                            {lang === 'uz' ? "Kelgan" : "Был"}
                          </button>

                          <button
                            onClick={() => handleMark(stu.id, false)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '8px 14px', borderRadius: 8, border: 'none',
                              cursor: 'pointer', transition: 'all 0.2s',
                              background: isPresent === false ? '#ef4444' : (dark ? '#222230' : '#e2e8f0'),
                              color: isPresent === false ? '#fff' : textSub,
                              fontWeight: 600, fontSize: '0.85rem'
                            }}
                          >
                            <CancelRoundedIcon fontSize="small" />
                            {lang === 'uz' ? "Kelmagan" : "Не был"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
