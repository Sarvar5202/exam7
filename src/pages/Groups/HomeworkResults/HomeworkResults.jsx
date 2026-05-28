import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../../api/api";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CircularProgress from "@mui/material/CircularProgress";

// Swagger: status enum → PENDING | REJECTED | ACCEPTED | CHECKED
const STATUS_MAP = {
  Kutayotganlar:     "PENDING",
  Qaytarilganlar:    "REJECTED",
  "Qabul qilinganlar": "ACCEPTED",
  Bajarilmagan:      "CHECKED",
};

const BADGE_CLS = {
  Kutayotganlar:       "bg-orange-100 text-orange-700",
  Qaytarilganlar:      "bg-red-100 text-red-700",
  "Qabul qilinganlar": "bg-green-100 text-green-700",
  Bajarilmagan:        "bg-slate-100 text-slate-700",
};

const TABS = ["Kutayotganlar", "Qaytarilganlar", "Qabul qilinganlar", "Bajarilmagan"];

// API response dan o'quvchilar ro'yxatini olish
const extractList = (res) => {
  const root = res?.data?.data ?? res?.data ?? {};
  if (Array.isArray(root)) return root;

  // Barcha mumkin bo'lgan field nomlarini tekshirish
  for (const key of ["students","results","homeworks","items","list","data","homeworkAnswers","answers","users"]) {
    if (Array.isArray(root[key])) return root[key];
  }

  // root o'zi object bo'lsa va ichida biror array bo'lsa — topib olish
  for (const val of Object.values(root)) {
    if (Array.isArray(val) && val.length > 0) return val;
  }

  return [];
};

// O'quvchi ismini response dagi turli field nomlardan olish
const getStudentName = (s) =>
  s?.full_name ??
  s?.name ??
  s?.student?.full_name ??
  s?.student?.name ??
  "-";

// O'quvchi ID sini olish (detail sahifaga navigatsiya uchun)
const getStudentId = (s) =>
  s?.id ?? s?.student_id ?? s?.student?.id ?? null;

export default function HomeworkResults() {
  const { id, homeworkId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL dan active tab ni olish, yo'q bo'lsa default "Kutayotganlar"
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    TABS.includes(urlTab) ? urlTab : "Kutayotganlar"
  );

  const [homeworkMeta, setHomeworkMeta] = useState(null);
  const [tabData, setTabData]   = useState({ Kutayotganlar: [], Qaytarilganlar: [], "Qabul qilinganlar": [], Bajarilmagan: [] });
  const [counts, setCounts]     = useState({ Kutayotganlar: 0, Qaytarilganlar: 0, "Qabul qilinganlar": 0, Bajarilmagan: 0 });
  const [loading, setLoading]   = useState(false);
  const [fetched, setFetched]   = useState({});   // qaysi tablar allaqachon yuklangan

  const formatDateTime = (s) => {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d)) return "-";
    const M = ["Yan","Fev","Mar","Apr","May","Iyun","Iyul","Avg","Sen","Okt","Noy","Dek"];
    return `${String(d.getDate()).padStart(2,"0")} ${M[d.getMonth()]}, ${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  // Birinchi yuklashda barcha tablar count va homework meta ma'lumotini olish
  useEffect(() => {
    if (!id || !homeworkId) return;

    const fetchAll = async () => {
      try {
        const responses = await Promise.all(
          TABS.map((tab) =>
            api.get(`/group/${id}/homework/${homeworkId}/results`, {
              // "Bajarilmagan" uchun CHECKED status 500 beradi —
              // status parametrsiz so'rov yuboramiz (barcha natijalar)
              params: tab === "Bajarilmagan" ? undefined : { status: STATUS_MAP[tab] },
            }).catch(() => ({ data: [] }))
          )
        );

        const newTabData = {};
        const newCounts  = {};
        let meta = null;

        responses.forEach((res, i) => {
          const tab  = TABS[i];
          const list = extractList(res);
          newTabData[tab] = list;
          newCounts[tab]  = list.length;

          // Homework meta ma'lumotini olish
          const root = res?.data?.data ?? res?.data ?? {};
          if (!meta && !Array.isArray(root)) {
            if (root.topic || root.homework?.topic || root.deadline || root.homework?.deadline) {
              meta = root;
            }
          }
        });

        if (meta) setHomeworkMeta(meta);
        setTabData(newTabData);
        setCounts(newCounts);
        setFetched({ Kutayotganlar: true, Qaytarilganlar: true, "Qabul qilinganlar": true, Bajarilmagan: true });
      } catch {
        // fetch xatosi — silent
      }
    };

    fetchAll();
  }, [id, homeworkId]);

  // Tab o'zgarganda — agar yuklanmagan bo'lsa fetch qilish
  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);
      setSearchParams({ tab }, { replace: true });

      if (fetched[tab]) return; // allaqachon yuklangan

      setLoading(true);
      api
        .get(`/group/${id}/homework/${homeworkId}/results`, {
          params: tab === "Bajarilmagan" ? undefined : { status: STATUS_MAP[tab] },
        })
        .then((res) => {
          const list = extractList(res);
          setTabData((prev) => ({ ...prev, [tab]: list }));
          setCounts((prev)  => ({ ...prev, [tab]: list.length }));
          setFetched((prev) => ({ ...prev, [tab]: true }));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    },
    [id, homeworkId, fetched, setSearchParams]
  );

  const students = tabData[activeTab] ?? [];
  const isLoading = loading && !fetched[activeTab];

  return (
    <div className="pt-6 flex flex-col gap-5 flex-1 min-h-0 overflow-auto pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/dashboard/groups/${id}?tab=1`)}
          className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowBackIosNewRoundedIcon fontSize="small" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          {homeworkMeta?.topic ?? homeworkMeta?.homework?.topic ?? "Uyga vazifa"}
        </h1>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Mavzu</p>
            <p className="text-sm font-semibold text-slate-800">
              {homeworkMeta?.topic ?? homeworkMeta?.homework?.topic ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Tugash vaqti</p>
            <p className="text-sm font-semibold text-slate-800">
              {formatDateTime(
                homeworkMeta?.deadline ??
                homeworkMeta?.homework?.deadline ??
                homeworkMeta?.end_date
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-row md:flex-col items-center md:items-end gap-2 flex-wrap">
          {TABS.map((tab) => (
            <div key={tab} className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{tab}:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BADGE_CLS[tab]}`}>
                {counts[tab]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs — mobilda gorizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-all ${
              activeTab === tab
                ? "bg-[#6c35de] text-white border-[#6c35de]"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                activeTab === tab ? "bg-white/20 text-white" : BADGE_CLS[tab]
              }`}
            >
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Table / Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <CircularProgress sx={{ color: "#6c35de" }} size={32} />
          </div>
        ) : students.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-400">
            Ma&apos;lumot mavjud emas
          </div>
        ) : (
          <>
            {/* Desktop jadval */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 font-semibold text-slate-500">#</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-500">O&apos;quvchi ismi</th>
                  <th className="text-right px-5 py-3 font-semibold text-slate-500">
                    Uyga vazifa jo&apos;natilgan vaqt
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const sid = getStudentId(student);
                  const dateToPass = student.submitted_at ?? student.created_at ?? student.sent_at ?? "";
                  return (
                    <tr
                      key={sid ?? idx}
                      onClick={() => {
                        if (!sid) return;
                        navigate(`/dashboard/groups/${id}/homework/${homeworkId}/results/${sid}?tab=${encodeURIComponent(activeTab)}&date=${encodeURIComponent(dateToPass)}`);
                      }}
                      className={`border-b border-slate-50 transition-colors ${sid ? "hover:bg-slate-50 cursor-pointer" : "opacity-60"}`}
                    >
                      <td className="px-5 py-3 text-slate-400 text-xs w-10">{idx + 1}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">{getStudentName(student)}</td>
                      <td className="px-5 py-3 text-right text-slate-500">
                        {formatDateTime(student.submitted_at ?? student.created_at ?? student.sent_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobil card ko'rinishi */}
            <div className="md:hidden flex flex-col divide-y divide-slate-50">
              {students.map((student, idx) => {
                const sid = getStudentId(student);
                const dateToPass = student.submitted_at ?? student.created_at ?? student.sent_at ?? "";
                return (
                  <div
                    key={sid ?? idx}
                    onClick={() => {
                      if (!sid) return;
                      navigate(`/dashboard/groups/${id}/homework/${homeworkId}/results/${sid}?tab=${encodeURIComponent(activeTab)}&date=${encodeURIComponent(dateToPass)}`);
                    }}
                    className={`flex items-center justify-between px-4 py-3.5 ${sid ? "active:bg-slate-50 cursor-pointer" : "opacity-60"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#6c35de]/10 text-[#6c35de] flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{getStudentName(student)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDateTime(student.submitted_at ?? student.created_at ?? student.sent_at)}
                        </p>
                      </div>
                    </div>
                    <span className="text-slate-300 text-lg">›</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
