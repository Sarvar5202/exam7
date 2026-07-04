import React, { useEffect, useState, useMemo, memo } from 'react';
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart,
  BarChart, Bar, Cell
} from 'recharts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/uz';
import 'dayjs/locale/ru';
dayjs.extend(relativeTime);

import {
  getTeacherGroups,
  getGroupStudents,
  getGroupHomeworks,
  getHomeworkResults,
  getAllAttendance,
} from '../../api/teacherApi';

import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import GroupIcon from '@mui/icons-material/Group';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Helper for animated numbers
const AnimatedNumber = ({ value }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);
    
    const animate = () => {
      start += increment;
      if (start < value) {
        setCount(Math.ceil(start));
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };
    
    if (value > 0) {
      requestAnimationFrame(animate);
    } else {
      setCount(0);
    }
  }, [value]);
  
  return <span>{count}</span>;
};

// Subcomponent: StatCard
const StatCard = memo(({ icon, title, value, loading, highlight, bgCard, borderCard, textMain, textSub, iconBg, darkIconBg, dark }) => {
  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      className={`p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 ${highlight ? 'ring-2 ring-red-400' : ''}`}
      style={{ backgroundColor: bgCard, border: `1px solid ${borderCard}` }}
    >
      <div 
        className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: dark ? darkIconBg : iconBg }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium m-0 mb-1" style={{ color: textSub }}>{title}</p>
        <h3 className="text-2xl font-bold m-0" style={{ color: textMain }}>
          {loading ? (
             <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-current animate-spin opacity-50" style={{ color: textSub }}></div>
          ) : (
            <AnimatedNumber value={value} />
          )}
        </h3>
      </div>
    </motion.div>
  );
});

// Subcomponent: AreaChart
const AttendanceChart = memo(({ data, dark, bgCard, borderCard, textMain, textSub, lang }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#334155' : '#e2e8f0'} />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: textSub, fontSize: 12 }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: textSub, fontSize: 12 }} />
        <RechartsTooltip 
          contentStyle={{ backgroundColor: bgCard, borderColor: borderCard, borderRadius: 8, color: textMain }}
          itemStyle={{ color: '#14b8a6', fontWeight: 'bold' }}
          formatter={(value) => [`${value}%`, lang === 'uz' ? 'Davomat' : 'Посещаемость']}
        />
        <Area type="monotone" dataKey="percent" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorPercent)" isAnimationActive={true} animationDuration={500} />
      </AreaChart>
    </ResponsiveContainer>
  );
});

// Subcomponent: BarChart
const PerformanceChart = memo(({ data, dark, bgCard, borderCard, textMain, textSub, lang }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#334155' : '#e2e8f0'} />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: textSub, fontSize: 12 }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: textSub, fontSize: 12 }} />
        <RechartsTooltip 
          contentStyle={{ backgroundColor: bgCard, borderColor: borderCard, borderRadius: 8, color: textMain }}
          cursor={{ fill: dark ? '#334155' : '#f1f5f9' }}
          formatter={(value) => [`${value}%`, lang === 'uz' ? 'Faollik' : 'Активность']}
        />
        <Bar dataKey="percent" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={500}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.percent > 75 ? '#3b82f6' : entry.percent > 40 ? '#f59e0b' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

// Main Component
export default function TeacherDashboard() {
  const { dark, lang } = useApp();
  const navigate = useNavigate();
  dayjs.locale(lang === 'uz' ? 'uz' : 'ru');

  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub = dark ? '#7070a0' : '#64748b';
  const bgCard = dark ? '#1e293b' : '#ffffff';
  const borderCard = dark ? '#334155' : '#e2e8f0';

  // States
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingHw, setLoadingHw] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [error, setError] = useState(null);

  const [groups, setGroups] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [todayClasses, setTodayClasses] = useState([]);
  const [uncheckedHwCount, setUncheckedHwCount] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  
  // Data for charts
  const [rawAttendanceData, setRawAttendanceData] = useState([]);
  const [rawPerformanceData, setRawPerformanceData] = useState([]);

  // Memoized Chart Data
  const attendanceChartData = useMemo(() => rawAttendanceData, [rawAttendanceData]);
  const performanceChartData = useMemo(() => rawPerformanceData, [rawPerformanceData]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      // START HEAVY ATTENDANCE FETCH IMMEDIATELY (PARALLEL)
      const attendancePromise = getAllAttendance().catch(e => {
        console.error("Attendance error:", e);
        return null;
      });

      let myGroups = [];
      try {
        setLoadingMain(true);
        // 1. Get Groups
        const groupsRes = await getTeacherGroups();
        const rawGroups = groupsRes.data?.data ?? groupsRes.data ?? [];
        myGroups = Array.isArray(rawGroups) ? rawGroups : [];
        if (isMounted) setGroups(myGroups);

        // 2. Compute today's classes
        const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        const todayName = dayNames[dayjs().day()];
        const todays = myGroups.filter(g => g.week_day && g.week_day.includes(todayName));
        todays.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
        if (isMounted) setTodayClasses(todays);

        // 3. Students Count (Parallel per group)
        const allStudentsPromises = myGroups.map(async (g) => {
           try {
             if (g.students && Array.isArray(g.students)) return g.students.length;
             const stRes = await getGroupStudents(g.id);
             const stData = stRes.data?.data ?? stRes.data ?? [];
             return Array.isArray(stData) ? stData.length : 0;
           } catch(e) { return 0; }
        });
        
        const counts = await Promise.all(allStudentsPromises);
        if (isMounted) setTotalStudents(counts.reduce((a, b) => a + b, 0));
        
        if (isMounted) setLoadingMain(false);

      } catch (err) {
        console.error("Main data error:", err);
        if (isMounted) {
           setError(lang === 'uz' ? "Ma'lumotlarni yuklashda xatolik yuz berdi" : "Ошибка при загрузке данных");
           setLoadingMain(false);
           setLoadingHw(false);
           setLoadingAttendance(false);
        }
        return;
      }

      // If no groups, finish up quickly
      if (myGroups.length === 0) {
        if (isMounted) {
          setLoadingHw(false);
          setLoadingAttendance(false);
        }
        return;
      }

      // START HOMEWORK FETCH (Parallel with attendance resolution)
      fetchHomeworks(myGroups);

      // RESOLVE ATTENDANCE
      try {
        const attRes = await attendancePromise;
        if (isMounted) processAttendance(attRes, myGroups);
      } finally {
        if (isMounted) setLoadingAttendance(false);
      }
    };

    const fetchHomeworks = async (myGroups) => {
      try {
        setLoadingHw(true);
        let pendingHwCount = 0;
        let recentHwActivities = [];

        const hwPromises = myGroups.map(async (g) => {
          try {
            const hwRes = await getGroupHomeworks(g.id);
            const rawHw = hwRes.data?.data ?? hwRes.data ?? [];
            const hws = Array.isArray(rawHw) ? rawHw : [];
            
            for (const hw of hws) {
              try {
                 const resPending = await getHomeworkResults(g.id, hw.id, 'PENDING');
                 const rawPending = resPending.data?.data ?? resPending.data ?? [];
                 const pendings = Array.isArray(rawPending) ? rawPending : [];
                 pendingHwCount += pendings.length;

                 pendings.forEach(p => {
                   recentHwActivities.push({
                     id: `hw-${p.id}`,
                     type: 'homework_pending',
                     title: `Yangi vazifa topshirildi: ${hw.title || 'Nomsiz'}`,
                     group: g.name,
                     date: p.created_at || new Date().toISOString()
                   });
                 });
              } catch(e) {}
            }
          } catch(e) {}
        });

        await Promise.all(hwPromises);

        if (isMounted) {
          setUncheckedHwCount(pendingHwCount);
          recentHwActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
          setActivityFeed(recentHwActivities.slice(0, 8));
        }
      } catch (error) {
        console.error("HW error:", error);
      } finally {
        if (isMounted) setLoadingHw(false);
      }
    };

    const processAttendance = (attRes, myGroups) => {
      if (!attRes) return;
      
      const rawAtt = attRes.data?.data ?? attRes.data ?? [];
      const allAtt = Array.isArray(rawAtt) ? rawAtt : [];
      
      const myGroupIds = myGroups.map(g => g.id);
      const myAtt = allAtt.filter(a => myGroupIds.includes(a.group_id));

      const byDate = {};
      const groupPerformance = {};

      myGroups.forEach(g => {
        groupPerformance[g.id] = { name: g.name, total: 0, present: 0 };
      });

      myAtt.forEach(a => {
        const dateStr = a.created_at ? dayjs(a.created_at).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
        if (!byDate[dateStr]) byDate[dateStr] = { date: dateStr, total: 0, present: 0 };
        
        byDate[dateStr].total += 1;
        if (a.isPresent) byDate[dateStr].present += 1;

        if (groupPerformance[a.group_id]) {
           groupPerformance[a.group_id].total += 1;
           if (a.isPresent) groupPerformance[a.group_id].present += 1;
        }
      });

      const chartData = Object.values(byDate)
        .sort((a,b) => a.date.localeCompare(b.date))
        .map(item => ({
          date: dayjs(item.date).format('DD MMM'),
          percent: Math.round((item.present / item.total) * 100) || 0
        }))
        .slice(-14);

      setRawAttendanceData(chartData);

      const perfData = Object.values(groupPerformance).map(item => ({
         name: item.name,
         percent: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0
      }));
      setRawPerformanceData(perfData);
    };

    loadDashboard();
    
    return () => { isMounted = false; };
  }, [lang]);

  // Render Skeleton for Cards
  const renderCardSkeleton = () => (
    <div className="animate-pulse flex p-4 rounded-xl items-center gap-4" style={{ backgroundColor: bgCard, border: `1px solid ${borderCard}` }}>
      <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
      </div>
    </div>
  );

  return (
    <div className="pb-8 overflow-x-hidden min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <SchoolRoundedIcon style={{ color: '#14b8a6', fontSize: 32 }} />
          <h1 className="text-2xl font-bold m-0" style={{ color: textMain }}>
            {lang === 'uz' ? "Bosh sahifa" : "Главная страница"}
          </h1>
        </div>
        <p className="text-sm m-0" style={{ color: textSub }}>
          {lang === 'uz' ? "O'qituvchi paneliga xush kelibsiz!" : "Добро пожаловать в панель учителя!"}
        </p>
      </div>

      {error ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 mb-6 border border-red-200">
          {error}
        </div>
      ) : null}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loadingMain ? (
          <>
            {renderCardSkeleton()}
            {renderCardSkeleton()}
            {renderCardSkeleton()}
            {renderCardSkeleton()}
          </>
        ) : (
          <>
            <StatCard 
              icon={<GroupIcon style={{ color: '#3b82f6' }} />}
              title={lang === 'uz' ? "Guruhlarim" : "Мои группы"}
              value={groups.length}
              bgCard={bgCard} borderCard={borderCard} textMain={textMain} textSub={textSub}
              iconBg="#dbeafe" darkIconBg="rgba(59, 130, 246, 0.2)" dark={dark}
            />
            <StatCard 
              icon={<PeopleAltIcon style={{ color: '#8b5cf6' }} />}
              title={lang === 'uz' ? "Jami o'quvchilar" : "Всего студентов"}
              value={totalStudents}
              bgCard={bgCard} borderCard={borderCard} textMain={textMain} textSub={textSub}
              iconBg="#ede9fe" darkIconBg="rgba(139, 92, 246, 0.2)" dark={dark}
            />
            <StatCard 
              icon={<CalendarTodayIcon style={{ color: '#10b981' }} />}
              title={lang === 'uz' ? "Bugungi darslar" : "Занятия сегодня"}
              value={todayClasses.length}
              bgCard={bgCard} borderCard={borderCard} textMain={textMain} textSub={textSub}
              iconBg="#d1fae5" darkIconBg="rgba(16, 185, 129, 0.2)" dark={dark}
            />
            <StatCard 
              icon={<AssignmentIcon style={{ color: (uncheckedHwCount > 0 && !loadingHw) ? '#ef4444' : '#f59e0b' }} />}
              title={lang === 'uz' ? "Kutayotgan vazifalar" : "Ожидающие задания"}
              value={loadingHw ? null : (uncheckedHwCount !== null ? uncheckedHwCount : 0)}
              loading={loadingHw}
              highlight={uncheckedHwCount > 0}
              bgCard={bgCard} borderCard={borderCard} textMain={textMain} textSub={textSub}
              iconBg={uncheckedHwCount > 0 ? "#fee2e2" : "#fef3c7"} 
              darkIconBg={uncheckedHwCount > 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)"} dark={dark}
            />
          </>
        )}
      </div>

      {/* TWO COLUMNS: SCHEDULE & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Bugungi Jadval (45%) */}
        <div className="lg:col-span-5 flex flex-col gap-4 p-5 rounded-2xl shadow-sm" style={{ backgroundColor: bgCard, border: `1px solid ${borderCard}` }}>
          <h2 className="text-lg font-bold flex items-center gap-2 m-0" style={{ color: textMain }}>
            <CalendarTodayIcon fontSize="small" /> 
            {lang === 'uz' ? "Bugungi darslar jadvali" : "Расписание на сегодня"}
          </h2>
          
          {loadingMain ? (
            <div className="animate-pulse space-y-3 mt-2">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          ) : todayClasses.length > 0 ? (
            <div className="flex flex-col gap-3 mt-2">
              <AnimatePresence>
                {todayClasses.map((cls, idx) => (
                  <motion.div 
                    key={cls.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate(`/teacher/groups/${cls.id}`)}
                    className="flex justify-between items-center p-4 rounded-xl cursor-pointer transition-colors"
                    style={{ backgroundColor: dark ? '#334155' : '#f8fafc', border: `1px solid ${borderCard}` }}
                  >
                    <div>
                      <h3 className="font-semibold m-0 text-base" style={{ color: textMain }}>{cls.name}</h3>
                      <p className="text-xs m-0 mt-1 flex items-center gap-1" style={{ color: textSub }}>
                        <GroupIcon style={{ fontSize: 14 }} /> {cls.max_student} {lang === 'uz' ? "o'rin" : "мест"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-teal-600 dark:text-teal-400 block">{cls.start_time || "N/A"}</span>
                      <ChevronRightIcon style={{ color: textSub }} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 opacity-70">
              <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" alt="No classes" className="w-24 h-24 mb-4 opacity-50 grayscale" />
              <p className="text-center font-medium" style={{ color: textSub }}>
                {lang === 'uz' ? "Bugun darsingiz yo'q!" : "Сегодня у вас нет занятий!"}
              </p>
            </div>
          )}
        </div>

        {/* So'nggi faoliyat (55%) */}
        <div className="lg:col-span-7 flex flex-col gap-4 p-5 rounded-2xl shadow-sm" style={{ backgroundColor: bgCard, border: `1px solid ${borderCard}` }}>
          <h2 className="text-lg font-bold flex items-center gap-2 m-0" style={{ color: textMain }}>
            <NotificationsActiveIcon fontSize="small" /> 
            {lang === 'uz' ? "So'nggi faoliyat" : "Последняя активность"}
          </h2>
          
          <div className="mt-2 overflow-y-auto pr-2" style={{ maxHeight: '320px' }}>
            {loadingHw ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activityFeed.length > 0 ? (
              <div className="flex flex-col relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                <AnimatePresence>
                  {activityFeed.map((act, idx) => (
                    <motion.div 
                      key={act.id + idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6"
                    >
                      {/* Icon */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-blue-100 text-blue-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                        {act.type === 'homework_pending' ? <InsertDriveFileIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                      </div>
                      
                      {/* Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl" style={{ backgroundColor: dark ? '#334155' : '#f8fafc', border: `1px solid ${borderCard}` }}>
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-sm" style={{ color: textMain }}>{act.group}</div>
                          <time className="text-xs font-medium" style={{ color: textSub }}>
                            {dayjs(act.date).fromNow ? dayjs(act.date).fromNow() : dayjs(act.date).format('DD.MM.YY HH:mm')}
                          </time>
                        </div>
                        <div className="text-sm" style={{ color: textSub }}>{act.title}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 opacity-70">
                <p className="text-center font-medium" style={{ color: textSub }}>
                  {lang === 'uz' ? "Hozircha faoliyat yo'q" : "Пока нет активности"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Davomat Grafiki */}
        <div className="p-5 rounded-2xl shadow-sm" style={{ backgroundColor: bgCard, border: `1px solid ${borderCard}` }}>
          <h2 className="text-lg font-bold mb-4 m-0" style={{ color: textMain }}>
            {lang === 'uz' ? "Oylik davomat foizi" : "Ежемесячная посещаемость"}
          </h2>
          <div className="h-64 w-full">
            {loadingAttendance ? (
               <div className="w-full h-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
            ) : attendanceChartData.length > 0 ? (
               <AttendanceChart data={attendanceChartData} dark={dark} bgCard={bgCard} borderCard={borderCard} textMain={textMain} textSub={textSub} lang={lang} />
            ) : (
               <div className="flex items-center justify-center h-full opacity-60">
                 {lang === 'uz' ? "Ma'lumot yetarli emas" : "Недостаточно данных"}
               </div>
            )}
          </div>
        </div>

        {/* Faollik Ko'rsatkichi (Bar Chart) */}
        <div className="p-5 rounded-2xl shadow-sm" style={{ backgroundColor: bgCard, border: `1px solid ${borderCard}` }}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold m-0" style={{ color: textMain }}>
              {lang === 'uz' ? "Guruhlar bo'yicha faollik ko'rsatkichi" : "Показатель активности по группам"}
            </h2>
          </div>
          <p className="text-xs mb-4" style={{ color: textSub }}>
            {lang === 'uz' ? "*Davomat va HW bajarish foiziga asoslangan" : "*На основе посещаемости и выполнения ДЗ"}
          </p>
          <div className="h-56 w-full">
            {loadingAttendance ? (
               <div className="w-full h-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
            ) : performanceChartData.length > 0 ? (
               <PerformanceChart data={performanceChartData} dark={dark} bgCard={bgCard} borderCard={borderCard} textMain={textMain} textSub={textSub} lang={lang} />
            ) : (
               <div className="flex items-center justify-center h-full opacity-60">
                 {lang === 'uz' ? "Ma'lumot yetarli emas" : "Недостаточно данных"}
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
