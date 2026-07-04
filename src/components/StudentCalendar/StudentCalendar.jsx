import { useState } from 'react';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { useApp } from '../../context/AppContext';

export default function StudentCalendar() {
  const { dark, lang } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const bg = dark ? '#111118' : '#ffffff';
  const border = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub = dark ? '#8888aa' : '#64748b';

  const today = new Date();
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Yakshanba=0, biz Dushanbadan boshlaymiz
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNamesUz = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  const monthNamesRu = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const weekDaysUz = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
  const weekDaysRu = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const currentMonthName = lang === 'uz' ? monthNamesUz[currentDate.getMonth()] : monthNamesRu[currentDate.getMonth()];
  const currentWeekDays = lang === 'uz' ? weekDaysUz : weekDaysRu;

  // Kunlar massivi
  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDateClick = (day) => {
    if (!day) return;
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  return (
    <div style={{
      background: bg, borderRadius: 16, border: `1px solid ${border}`,
      padding: '20px', width: '100%',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: textMain, margin: 0 }}>
          {currentMonthName} {currentDate.getFullYear()}
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={prevMonth} style={{
            width: 32, height: 32, borderRadius: 8, border: `1px solid ${border}`,
            background: dark ? '#16161f' : '#f8fafc', color: textMain,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>
            <KeyboardArrowLeftRoundedIcon fontSize="small" />
          </button>
          <button onClick={nextMonth} style={{
            width: 32, height: 32, borderRadius: 8, border: `1px solid ${border}`,
            background: dark ? '#16161f' : '#f8fafc', color: textMain,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>
            <KeyboardArrowRightRoundedIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Hafta kunlari */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
        {currentWeekDays.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: textSub }}>
            {d}
          </div>
        ))}
      </div>

      {/* Kunlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 6px' }}>
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          
          const isToday = 
            d === today.getDate() && 
            currentDate.getMonth() === today.getMonth() && 
            currentDate.getFullYear() === today.getFullYear();

          const isSelected = 
            d === selectedDate.getDate() && 
            currentDate.getMonth() === selectedDate.getMonth() && 
            currentDate.getFullYear() === selectedDate.getFullYear();

          let bgColor = 'transparent';
          let textColor = textMain;

          if (isSelected) {
            bgColor = '#22c55e'; // Green circle for selected day
            textColor = '#ffffff';
          } else if (isToday) {
            bgColor = dark ? 'rgba(34,197,94,0.2)' : '#dcfce7'; // Light green for today
            textColor = '#16a34a';
          }

          return (
            <div key={i} style={{
              aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: isToday || isSelected ? 700 : 500,
              borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s',
              background: bgColor,
              color: textColor,
              border: isToday && !isSelected ? '1px solid #22c55e' : '1px solid transparent'
            }}
              onClick={() => handleDateClick(d)}
              onMouseOver={e => { if (!isSelected && !isToday) e.currentTarget.style.background = dark ? '#1e1e2a' : '#f1f5f9'; }}
              onMouseOut={e => { if (!isSelected && !isToday) e.currentTarget.style.background = 'transparent'; }}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
