import { useState, useEffect } from "react";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useApp } from "../../context/AppContext";

export default function Dashboard() {
  const [openAccordion, setOpenAccordion] = useState(0);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const { t, lang } = useApp();

  const stats = [
    { label: t.activeStudents,  value: "52",  icon: <SchoolRoundedIcon /> },
    { label: t.groupsCount,     value: "23",  icon: <GroupRoundedIcon /> },
    { label: t.monthPayments,   value: "0",   icon: <CreditCardRoundedIcon /> },
    { label: t.debtors,         value: "104", icon: <WarningRoundedIcon /> },
    { label: t.frozen,          value: "0",   icon: <AcUnitRoundedIcon /> },
    { label: t.archived,        value: "23",  icon: <ArchiveRoundedIcon /> },
  ];
  const accordionItems = [t.monthlyPayments, t.annualProfit, t.schedule];

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("currentUser");
      if (raw) {
        const user = JSON.parse(raw);
        const name =
          (user?.first_name && user?.last_name)
            ? `${user.first_name} ${user.last_name}`
            : user?.full_name || user?.name || user?.username || "";
        // Role normalizatsiyasi — barcha formatlarni qamrab olish
        const rawRole = (user?.role || '').toUpperCase().replace(/[-_\s]/g, '');
        const role =
          rawRole === "SUPERADMIN" ? "Super Admin" :
          rawRole === "ADMIN"      ? "Admin"       :
          rawRole === "TEACHER"    ? (lang === 'ru' ? "Учитель" : "O'qituvchi") :
          user?.role || "";
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserName(name);
        setUserRole(role);
      }
    } catch { /* silent */ }
  }, [lang]);

  return (
    <div className="pt-6 flex flex-col gap-6 flex-1 min-h-0 overflow-auto pb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t.dashboardGreeting}, <span className="text-[#6c35de]">{userName || userRole || "..."}</span>!
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {userRole && <span className="font-semibold text-slate-700">{userRole} • </span>}
          {t.dashboardWelcome}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl py-6 px-5 flex items-center gap-4 shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer hover:border-[#6c35de]/30"
          >
            <div className="w-14 h-14 rounded-xl bg-[#6c35de]/10 text-[#6c35de] flex items-center justify-center flex-shrink-0 [&_svg]:w-7 [&_svg]:h-7">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 leading-tight mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {accordionItems.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
            >
              <span>{item}</span>
              <KeyboardArrowDownRoundedIcon
                style={{ transform: openAccordion === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
                fontSize="small"
              />
            </button>
            {openAccordion === i && (
              <div className="px-5 pb-4 text-sm text-slate-500">
                Ma'lumotlar yuklanmoqda...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
