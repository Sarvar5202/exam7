import { useState, Suspense } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import TeacherSidebar from "../components/TeacherSidebar/TeacherSidebar";
import TeacherHeader from "../components/TeacherHeader/TeacherHeader";
import Loader from "../components/UI/Loader/Loader";
import Toast from "../components/UI/Toast/Toast";
import { useApp } from "../context/AppContext";
import BackButton from "../components/BackButton/BackButton";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

const BOTTOM_NAV = [
  { icon: <HomeRoundedIcon fontSize="small" />,          label_uz: "Bosh sahifa",  label_ru: "Главная",    path: "/teacher/dashboard",   exact: true },
  { icon: <GroupRoundedIcon fontSize="small" />,         label_uz: "Guruhlarim",   label_ru: "Группы",     path: "/teacher/groups",      exact: false },
  { icon: <AssignmentRoundedIcon fontSize="small" />,    label_uz: "Vazifalar",    label_ru: "Задания",    path: "/teacher/homework",    exact: false },
  { icon: <CalendarMonthRoundedIcon fontSize="small" />, label_uz: "Davomat",      label_ru: "Посещ.",     path: "/teacher/attendance",  exact: false },
];

export default function TeacherLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobMenuOpen, setMobMenuOpen] = useState(false);
  const { dark, lang } = useApp();
  const { pathname } = useLocation();

  const toggleSidebar = () => setIsCollapsed(p => !p);

  const bg     = dark ? '#0a0a0f' : '#eef0f5';
  const navBg  = dark ? '#0d0d14' : '#ffffff';
  const border = dark ? '#1e1e2a' : '#f0f0f5';

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: bg, transition: 'background 0.25s',
    }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <TeacherSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      {/* Mobile sidebar drawer */}
      {isMobMenuOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-[90]"
            onClick={() => setMobMenuOpen(false)} />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 z-[95]">
            <TeacherSidebar isCollapsed={false} toggleSidebar={() => setMobMenuOpen(false)} />
          </div>
        </>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TeacherHeader onMenuClick={() => setMobMenuOpen(p => !p)} />

        <main className="flex-1 overflow-y-auto px-3 lg:px-6"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="pb-20 lg:pb-0">
            <BackButton />
            <Suspense fallback={<Loader fullScreen={false} />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[80] flex items-center justify-around px-2 py-1"
        style={{
          background: navBg, borderTop: `1px solid ${border}`,
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)', minHeight: 60,
        }}>
        {BOTTOM_NAV.map((item) => {
          const active = item.exact ? pathname === item.path : pathname.startsWith(item.path);
          const label  = lang === 'uz' ? item.label_uz : item.label_ru;
          return (
            <NavLink key={item.path} to={item.path}
              onClick={() => setMobMenuOpen(false)} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 12px', borderRadius: 10,
                background: active ? 'rgba(20,184,166,0.12)' : 'transparent',
                color: active ? '#14b8a6' : (dark ? '#55556a' : '#94a3b8'),
                transition: 'all 0.2s', minWidth: 52,
              }}>
                {item.icon}
                <span style={{ fontSize: '0.65rem', fontWeight: active ? 700 : 500 }}>{label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>
      <Toast />
    </div>
  );
}
