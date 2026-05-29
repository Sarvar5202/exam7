import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

export default function ManagementSidebar({ isOpen, isCollapsed, onClose }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useApp();
  const currentSlug = pathname.split("/").pop() || "courses";

  const subMenuItems = [
    { label: t.courses,     slug: "courses",      icon: <MenuBookRoundedIcon /> },
    { label: t.rooms,       slug: "rooms",        icon: <MeetingRoomRoundedIcon /> },
    { label: t.staff,       slug: "staff",        icon: <BadgeRoundedIcon /> },
    { label: t.coin,        slug: "coin",         icon: <MonetizationOnRoundedIcon /> },
    { label: t.sendMessage, slug: "send-message", icon: <SendRoundedIcon /> },
  ];

  return (
    <div className={`
        fixed top-0 bottom-0 bg-white border-r border-slate-100 z-[90]
        flex flex-col transition-all duration-300 shadow-xl
        ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
        ${isCollapsed ? 'left-20' : 'left-[260px]'}
        w-56
      `}
    >
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Menu</h3>
      </div>
      <div className="flex flex-col gap-1 p-3 flex-1">
        {subMenuItems.map((item) => {
          const isActive = currentSlug === item.slug;
          return (
            <div
              key={item.slug}
              onClick={() => { onClose(); navigate(`/management/${item.slug}`); }}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all
                ${isActive ? 'bg-[#6c35de] text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <span className="flex items-center">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
