import { useState } from "react";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const stats = [
  { label: "Faol talabalar", value: "52", icon: <SchoolRoundedIcon /> },
  { label: "Guruhlar", value: "23", icon: <GroupRoundedIcon /> },
  { label: "Joriy oy to'lovlar", value: "0", icon: <CreditCardRoundedIcon /> },
  { label: "Qarzdorlar", value: "104", icon: <WarningRoundedIcon /> },
  { label: "Muzlatilganlar", value: "0", icon: <AcUnitRoundedIcon /> },
  { label: "Arxivdagilar", value: "23", icon: <ArchiveRoundedIcon /> },
];

const accordionItems = [
  "Joriy oy uchun to'lovlar",
  "Yillik Foyda",
  "Dars jadvali",
];

export default function Dashboard() {
  const [openAccordion, setOpenAccordion] = useState(0);

  return (
    <div className="pt-6 flex flex-col gap-6 flex-1 min-h-0 overflow-auto pb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Salom!</h1>
        <p className="text-sm text-slate-500 mt-1">Najot CRM platformasiga xush kelibsiz!</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#6c35de]/10 text-[#6c35de] flex items-center justify-center flex-shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-slate-500 leading-tight">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
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
