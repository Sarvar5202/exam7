import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../api/api";
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const FILE_BASE = API_BASE.replace(/\/api\/v1\/?$/, '');

const compact = (value) => String(value || "").replace(/^\/+/, "");
const uniq = (items) => [...new Set(items.filter(Boolean))];
const absoluteFileUrl = (value) => {
  if (!value) return [];
  const raw = String(value).trim();
  if (!raw) return [];
  if (/^https?:\/\//i.test(raw) || raw.startsWith("blob:")) return [raw];
  if (raw.startsWith("/api/v1/")) return [`${FILE_BASE}${raw}`];
  if (raw.startsWith("/")) return [`${FILE_BASE}${raw}`];

  const path = compact(raw);
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return [
    `${FILE_BASE}/${encodedPath}`,
    `${FILE_BASE}/files/${encodedPath}`,
    `${FILE_BASE}/files/files/${encodedPath}`,
    `${API_BASE}/files/${encodedPath}`,
  ];
};

const getVideoUrls = (v) => {
  const directFields = [
    v?.video_url,
    v?.url,
    v?.file_url,
    v?.videoUrl,
    v?.src,
    v?.link,
    v?.file?.url,
    v?.file?.path,
  ];
  const pathFields = [
    v?.path,
    v?.filepath,
    v?.file_path,
    v?.video_path,
    v?.location,
    v?.key,
  ];
  const nameFields = [
    v?.filename,
    v?.fileName,
    v?.storedName,
    v?.originalname,
    v?.name,
  ];

  return uniq([...directFields, ...pathFields, ...nameFields].flatMap(absoluteFileUrl));
};

const getVideoUrl = (v) => getVideoUrls(v)[0] || "";

const getVideoList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const key of ["data", "files", "items", "rows", "result", "videos"]) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      const nested = getVideoList(value);
      if (nested.length) return nested;
    }
  }

  return [payload];
};

// Video player komponenti
function VideoPlayer({ video }) {
  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const blobRef = useRef("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSrc("");
    setLoading(true);
    setErrMsg("");

    const urls = getVideoUrls(video);

    if (!urls.length) {
      setErrMsg("Video URL topilmadi");
      setLoading(false);
      return;
    }

    const token = sessionStorage.getItem("accessToken");

    const load = async () => {
      for (const url of urls) {
        try {
          const res = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          blobRef.current = blobUrl;
          setSrc(blobUrl);
          setLoading(false);
          return;
        } catch {
          // Keyingi ehtimoliy static URL bilan urinib ko'ramiz.
        }
      }

      setSrc(urls[0]);
      setLoading(false);
    };

    load();

    return () => {
      if (blobRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(blobRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 bg-black gap-3">
      <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <span className="text-white/40 text-xs">Yuklanmoqda...</span>
    </div>
  );

  if (errMsg && !src) return (
    <div className="flex flex-col items-center justify-center py-16 bg-black gap-2">
      <span className="text-white/50 text-sm">{errMsg}</span>
      <span className="text-white/30 text-xs">{getVideoUrl(video)}</span>
    </div>
  );

  return (
    <video
      controls
      autoPlay
      className="w-full max-h-[70vh] bg-black"
      src={src}
      onError={(e) => {
        console.error("Video error:", e);
        setErrMsg("Video formati qo'llab-quvvatlanmaydi yoki yuklanmadi");
        setSrc("");
      }}
    />
  );
}

const thCls = "text-left px-4 py-3 font-semibold text-slate-500 text-xs";
const tdCls = "px-4 py-3 text-sm text-slate-700";

export default function Videolar({ refreshTrigger }) {
  const { id } = useParams();
  const [videosData, setVideosData] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const fetchedRef = useRef(false);

  const formatDate = (s) => {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "";
    const months = ["Yan","Fev","Mar","Apr","May","Iyun","Iyul","Avg","Sen","Okt","Noy","Dek"];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]}, ${d.getFullYear()}`;
  };

  const formatFileSize = (size) => {
    if (!size) return "-";
    if (typeof size === "string" && size.includes("MB")) return size;
    const bytes = Number(size);
    if (isNaN(bytes) || bytes === 0) return size || "-";
    const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const fetchVideos = async () => {
    fetchedRef.current = true;
    try {
      const res = await api.get(`/files/${id}`);
      const list = getVideoList(res.data)
        .filter(Boolean)
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setVideosData(list);
    } catch {
      fetchedRef.current = false;
    }
  };

  useEffect(() => {
    if (id) {
      fetchedRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchVideos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, refreshTrigger]);

  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className={thCls}>#</th>
            <th className={thCls}>Video nomi</th>
            <th className={thCls}>Dars nomi</th>
            <th className={thCls}>Status</th>
            <th className={thCls}>Dars sanasi</th>
            <th className={thCls}>Hajmi</th>
            <th className={thCls}>Qo'shilgan</th>
            <th className={thCls}></th>
          </tr>
        </thead>
        <tbody>
          {videosData.length > 0 ? (
            videosData.map((v, idx) => (
              <tr key={v.id || idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className={tdCls}>{idx + 1}</td>
                <td className={tdCls}>
                  <div
                    className="flex items-center gap-2 cursor-pointer text-[#6c35de] hover:underline"
                    onClick={() => setSelectedVideo(v)}
                  >
                    <PlayCircleOutlineRoundedIcon fontSize="small" />
                    <span>{v.originalname || v.title || v.videoName || v.name || "Video"}</span>
                  </div>
                </td>
                <td className={tdCls}>{v.lesson?.topic || v.lessonName || "-"}</td>
                <td className={tdCls}>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {v.status || "Tayyor"}
                  </span>
                </td>
                <td className={tdCls + " text-slate-500"}>
                  {v.lesson?.created_at ? formatDate(v.lesson.created_at) : v.lessonDate || "-"}
                </td>
                <td className={tdCls + " text-slate-500"}>
                  {v.size_mb
                    ? parseFloat(v.size_mb).toFixed(2) + " MB"
                    : formatFileSize(v.size || v.file_size)}
                </td>
                <td className={tdCls + " text-slate-500"}>{formatDate(v.created_at || v.addedTime)}</td>
                <td className={tdCls}>
                  <MoreVertRoundedIcon className="text-slate-400" fontSize="small" />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-8 text-slate-400 text-sm">
                Videolar topilmadi
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Video modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-[#1a1a2e] rounded-2xl overflow-hidden w-[860px] max-w-[95vw] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-white font-semibold text-sm truncate max-w-[600px]">
                {selectedVideo.originalname || selectedVideo.title || selectedVideo.name || "Video"}
              </h2>
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>

            {/* Video player */}
            <VideoPlayer video={selectedVideo} />
          </div>
        </div>
      )}
    </>
  );
}
