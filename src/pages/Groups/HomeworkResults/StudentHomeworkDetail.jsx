import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../../api/api";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CircularProgress from "@mui/material/CircularProgress";

const STATUS_LABELS = {
  PENDING:  "Kutilmoqda",
  ACCEPTED: "Qabul qilindi",
  REJECTED: "Qaytarildi",
  CHECKED:  "Tekshirildi",
};
const STATUS_COLORS = {
  PENDING:  "bg-orange-100 text-orange-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CHECKED:  "bg-slate-100 text-slate-600",
};
const TAB_TO_STATUS = {
  Kutayotganlar:       "PENDING",
  Qaytarilganlar:      "REJECTED",
  "Qabul qilinganlar": "ACCEPTED",
  Bajarilmagan:        "CHECKED",
};

const FILE_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? '';

// Fayl URL ni to'g'ri shakllantirish
const getFileUrl = (file) => {
  const path =
    typeof file === "string"
      ? file
      : file?.url ?? file?.path ?? file?.file_url ?? file?.filename ?? "";
  if (typeof path === "string" && path.startsWith("http")) return path;
  return `${FILE_BASE}/files/files/${path}`;
};

const isImage = (file) => {
  const p = (
    typeof file === "string" ? file : file?.url ?? file?.path ?? file?.filename ?? ""
  ).toLowerCase();
  return /\.(jpg|jpeg|png|gif|webp|svg)$/.test(p);
};

export default function StudentHomeworkDetail() {
  const { id, homeworkId, resultId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tabLabel  = decodeURIComponent(searchParams.get("tab") || "Kutayotganlar");
  const dateParam = decodeURIComponent(searchParams.get("date") || "");

  const [detail,       setDetail]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [lightboxImg,  setLightboxImg]  = useState(null);
  const [ballValue,    setBallValue]    = useState(60);
  const [checkComment, setCheckComment] = useState("");
  const [error,        setError]        = useState(null);

  const sliderColor = ballValue >= 60 ? "#22c55e" : "#ef4444";

  // Swagger: GET /group/{groupId}/homework/{homeworkId}/result/{studentId}
  useEffect(() => {
    if (!id || !homeworkId || !resultId) return;
    setLoading(true);
    setError(null);

    api
      .get(`/group/${id}/homework/${homeworkId}/result/${resultId}`)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? {};
        setDetail(data);
        if (data?.grade != null) setBallValue(Number(data.grade));
        if (data?.title) setCheckComment(data.title);
      })
      .catch(() => {
        setError("Ma'lumot yuklanmadi. Sahifani yangilang.");
      })
      .finally(() => setLoading(false));
  }, [id, homeworkId, resultId]);

  // Swagger: POST /group/{groupId}/homework/{homeworkId}/check
  // Body: { grade: number, title: string, homework_answer_id: number }
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const answerId = detail?.id ?? Number(resultId);

      const payload = {
        grade:              ballValue,
        title:              checkComment.trim() || " ",
        homework_answer_id: answerId,
      };

      const res = await api.post(`/group/${id}/homework/${homeworkId}/check`, payload);
      void res;

      navigate(
        `/dashboard/groups/${id}/homework/${homeworkId}/results?tab=${encodeURIComponent(tabLabel)}`
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        (typeof err?.response?.data === "string" ? err.response.data : null) ??
        `Server xatosi: ${err?.response?.status ?? "noma'lum"}`;
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (s) => {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d)) return "-";
    const M = ["Yan","Fev","Mar","Apr","May","Iyun","Iyul","Avg","Sen","Okt","Noy","Dek"];
    return `${String(d.getDate()).padStart(2,"0")} ${M[d.getMonth()]}, ${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  // Response strukturasidan kerakli ma'lumotlarni olish
  const displayStudentName  = detail?.student?.full_name ?? detail?.students?.full_name ?? detail?.full_name ?? detail?.name ?? "O'quvchi";
  const displayStatus       = detail?.status ?? TAB_TO_STATUS[tabLabel] ?? "PENDING";
  const displayComment      = detail?.title ?? detail?.comment ?? detail?.description ?? "";
  const displayHomeworkDesc = detail?.homework?.description ?? detail?.homework?.topic ?? detail?.homework?.title ?? "";
  const displaySubmittedAt  = dateParam || (detail?.submitted_at ?? detail?.created_at ?? "");

  // Fayl(lar) ni olish
  const rawFiles   = detail?.file ?? detail?.files ?? detail?.attachments ?? null;
  const displayFiles = rawFiles
    ? Array.isArray(rawFiles) ? rawFiles : [rawFiles]
    : [];

  return (
    <div className="pt-4 md:pt-6 flex flex-col gap-4 md:gap-5 flex-1 min-h-0 overflow-auto pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() =>
            navigate(
              `/dashboard/groups/${id}/homework/${homeworkId}/results?tab=${encodeURIComponent(tabLabel)}`
            )
          }
          className="flex items-center gap-1.5 text-[#6c35de] font-semibold hover:underline"
        >
          <ArrowBackIosNewRoundedIcon style={{ fontSize: 14 }} />
          {tabLabel}
        </button>
        <span className="text-slate-300">›</span>
        <span className="text-slate-500">Uyga vazifa tekshirish</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <CircularProgress sx={{ color: "#6c35de" }} size={36} />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-16 text-red-500 text-sm">{error}</div>
      ) : (
        <>
          {/* Homework description */}
          {displayHomeworkDesc && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Uy vazifasi</h3>
              <div className="bg-slate-50 rounded-xl p-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Izoh:</span>
                <p className="text-sm text-slate-700 mt-1">{displayHomeworkDesc}</p>
              </div>
            </div>
          )}

          {/* Student submission card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">{displayStudentName}</h2>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  STATUS_COLORS[displayStatus] ?? STATUS_COLORS.PENDING
                }`}
              >
                {STATUS_LABELS[displayStatus] ?? displayStatus}
              </span>
            </div>

            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-slate-400 mb-1">Topshirilgan vaqt</p>
                <p className="text-sm font-semibold text-slate-800">{formatDateTime(displaySubmittedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Fayllar soni</p>
                <p className="text-sm font-semibold text-slate-800">{displayFiles.length}</p>
              </div>
              {detail?.grade != null && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ball</p>
                  <p
                    className="text-sm font-bold"
                    style={{ color: Number(detail.grade) >= 60 ? "#22c55e" : "#ef4444" }}
                  >
                    {detail.grade}
                  </p>
                </div>
              )}
            </div>

            {/* O'quvchi fayllari */}
            {displayFiles.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Yuklangan fayllar:{" "}
                  <strong className="text-slate-900">{displayFiles.length}</strong>
                </p>
                <div className="flex flex-wrap gap-3">
                  {displayFiles.map((file, idx) =>
                    isImage(file) ? (
                      <img
                        key={idx}
                        src={getFileUrl(file)}
                        alt={`fayl-${idx + 1}`}
                        className="w-24 h-24 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setLightboxImg(getFileUrl(file))}
                      />
                    ) : (
                      <a
                        key={idx}
                        href={getFileUrl(file)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#6c35de] font-medium hover:bg-slate-100 transition-colors"
                      >
                        📎 {file?.filename ?? file?.name ?? `Fayl ${idx + 1}`}
                      </a>
                    )
                  )}
                </div>
              </div>
            )}

            {/* O'quvchi izohi */}
            {displayComment && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 mb-1">O&apos;quvchi izohi:</p>
                <p className="text-sm text-slate-700">
                  {displayComment.startsWith("http") ? (
                    <a
                      href={displayComment}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#6c35de] underline"
                    >
                      {displayComment}
                    </a>
                  ) : (
                    displayComment
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Tekshirish (grading) card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-5">
            <h3 className="text-base font-bold text-slate-900">Tekshirish</h3>

            {/* Info */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <InfoOutlinedIcon className="text-blue-500 mt-0.5 flex-shrink-0" fontSize="small" />
              <span className="text-sm text-blue-700">
                60–100 ball —{" "}
                <strong className="text-green-700">Qabul qilinadi</strong>. &nbsp; 0–59 ball —{" "}
                <strong className="text-red-700">Qaytariladi</strong>.
              </span>
            </div>

            {/* Ball slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900">Ball</h4>
                <div
                  className="w-14 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold"
                  style={{ color: sliderColor, borderColor: sliderColor }}
                >
                  {ballValue}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={ballValue}
                onChange={(e) => setBallValue(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${sliderColor} ${ballValue}%, #e2e8f0 ${ballValue}%)`,
                }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-red-400">0</span>
                <span className="text-xs text-slate-400">O&apos;tish bali: 60</span>
                <span className="text-xs text-green-400">100</span>
              </div>
            </div>

            {/* Izoh textarea */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Izoh</h4>
              <textarea
                value={checkComment}
                onChange={(e) => setCheckComment(e.target.value)}
                placeholder="O'quvchiga izoh yozing (ixtiyoriy)"
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6c35de] focus:ring-2 focus:ring-[#6c35de]/20 outline-none resize-none transition-all"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                ⚠️ {error}
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
            <button
              onClick={() =>
                navigate(
                  `/dashboard/groups/${id}/homework/${homeworkId}/results?tab=${encodeURIComponent(tabLabel)}`
                )
              }
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#6c35de] rounded-xl hover:bg-[#5a2cc0] transition-colors disabled:opacity-50"
            >
              {submitting && <CircularProgress size={14} sx={{ color: "white" }} />}
              {submitting ? "Yuborilmoqda..." : "Yuborish"}
            </button>
            </div>
          </div>
        </>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] cursor-pointer"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt="preview"
            className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
