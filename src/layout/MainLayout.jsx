import { useState, Suspense } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import SubSidebar from "../components/ManagementSidebar/ManagementSidebar";
import Loader from "../components/UI/Loader/Loader";
import Toast from "../components/UI/Toast/Toast";
import { useApp } from "../context/AppContext";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

const BOTTOM_NAV = [
  { icon: <HomeRoundedIcon fontSize="small" />,    label: "Asosiy",      path: "/dashboard",          exact: true },
  { icon: <PersonRoundedIcon fontSize="small" />,  label: "O'qituvchi",  path: "/dashboard/teachers", exact: false },
  { icon: <GroupRoundedIcon fontSize="small" />,   label: "Guruhlar",    path: "/dashboard/groups",   exact: false },
  { icon: <DiamondRoundedIcon fontSize="small" />, label: "Talabalar",   path: "/dashboard/students", exact: false },
  { icon: <SettingsRoundedIcon fontSize="small" />,label: "Boshqarish",  path: "/management",         exact: false },
];

export default function MainLayout() {
  const [isCollapsed, setIsCollapsed]   = useState(false);
  const [isSubOpen,   setIsSubOpen]     = useState(false);
  const [isMobMenuOpen, setMobMenuOpen] = useState(false);
  const { dark } = useApp();
  const { pathname } = useLocation();

  const toggleSidebar    = () => setIsCollapsed(p => !p);
  const toggleSubSidebar = () => setIsSubOpen(p => !p);
  const closeSubSidebar  = () => setIsSubOpen(false);

  const bg     = dark ? '#0a0a0f' : '#eef0f5';
  const navBg  = dark ? '#0d0d14' : '#ffffff';
  const border = dark ? '#1e1e2a' : '#f0f0f5';

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: bg,
      transition: 'background 0.25s',
    }}>

      {/* Desktop sidebar — mobilda yashiriladi */}
      <div className="hidden lg:flex">
        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
          isSubSidebarOpen={isSubOpen}
          toggleSubSidebar={toggleSubSidebar}
        />
        <SubSidebar isOpen={isSubOpen} isCollapsed={isCollapsed} onClose={closeSubSidebar} />
      </div>

      {/* Mobil: sidebar drawer (hamburger bilan ochiladi) */}
      {isMobMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-[90]"
            onClick={() => setMobMenuOpen(false)}
          />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 z-[95]">
            <Sidebar
              isCollapsed={false}
              toggleSidebar={() => setMobMenuOpen(false)}
              isSubSidebarOpen={isSubOpen}
              toggleSubSidebar={toggleSubSidebar}
            />
          </div>
        </>
      )}

      {/* Desktop SubSidebar backdrop */}
      <div
        className="hidden lg:block"
        onClick={closeSubSidebar}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 85,
          opacity: isSubOpen ? 1 : 0,
          pointerEvents: isSubOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s',
        }}
      />

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <Header onMenuClick={() => setMobMenuOpen(p => !p)} />

        {/* Sahifa content — mobilda pastki nav uchun padding */}
        <main
          className="flex-1 overflow-y-auto px-3 lg:px-6"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* Mobilda pastki nav balandligi uchun joy */}
          <div className="pb-20 lg:pb-0">
            <Suspense fallback={<Loader fullScreen={false} />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {/* Mobil bottom navigation bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[80] flex items-center justify-around px-2 py-1"
        style={{
          background: navBg,
          borderTop: `1px solid ${border}`,
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)',
          minHeight: 60,
        }}
      >
        {BOTTOM_NAV.map((item) => {
          const active = item.exact
            ? pathname === item.path
            : pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobMenuOpen(false)}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '6px 12px',
                borderRadius: 10,
                background: active ? 'rgba(108,53,222,0.12)' : 'transparent',
                color: active ? '#6c35de' : (dark ? '#55556a' : '#94a3b8'),
                transition: 'all 0.2s',
                minWidth: 52,
              }}>
                {item.icon}
                <span style={{ fontSize: '0.65rem', fontWeight: active ? 700 : 500 }}>
                  {item.label}
                </span>
              </div>
            </NavLink>
          );
        })}
      </nav>
      <Toast />
    </div>
  );
}
