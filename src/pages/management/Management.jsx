import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Suspense } from "react";
import Loader from "../../components/UI/Loader/Loader";

const tabs = [
  { label: "Kurslar", slug: "courses" },
  { label: "Xonalar", slug: "rooms" },
  { label: "Xodimlar", slug: "staff" },
];

export default function Management() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const currentTab = pathname.split("/").pop() || "courses";

  return (
    <div className="pt-6 flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
      {pathname !== "/management" && (
        <div className="flex flex-col gap-4">
          <h1 className="text-[28px] font-bold text-[#1a1a2e] m-0">Boshqarish</h1>
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.slug}
                onClick={() => navigate(`/management/${tab.slug}`)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all ${currentTab === tab.slug ? 'bg-[#6c35de] text-white border-[#6c35de]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Suspense fallback={<Loader fullScreen={false} />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
