import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../api/api";
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

const FILE_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? '';

// Video URL ni barcha mumkin bo'lgan field nomlardan olish
const getVideoUrl = (v, base) => {
  const direct =
    v?.video_url || v?.url || v?.path || v?.file_url ||
    v?.videoUrl || v?.src || v?.link || v?.filepath ||
    v?.filename || v?.originalname || "";

  if (!direct) return "";
  if (direct.startsWith("http")) return direct;
  return `${base}/files/${direct.replace(/^\/+/, "")}`;
};

// Video player — token bilan Blob URL yasaydi
function VideoPlayer({ video, base }) {
  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    const url = getVideoUrl(video, base);
    if (!url) { setErr(true); setLoading(false); return; }

    // Tokenli so'rov orqali video ma'lumotlarini olish
    const token = sessionStorage.getItem("accessToken");
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(res => {
        if (!res.ok) throw new Error(res.status);
        return res.blob();
      })
      .then(blob => {
        setSrc(URL.createObjectURL(blob));
        setLoading(false);
      })
      .catch(() => {
        // Blob olmasa to'g'ridan URL bilan urinib ko'ramiz
        setSrc(url);
        setLoading(false);
      });

    return () => { if (src.startsWith("blob:")) URL.revokeObjectURL(src); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video]);

  if (loading) return (
    <div className="flex items-center justify-center py-16 bg-black">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (err || !src) return (
    <div className="flex items-center justify-center py-16 bg-black text-white/50 text-sm">
      Video yuklanmadi
    </div>
  );

  return <video controls autoPlay className="w-full max-h-[70vh]" src={src} />;
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
    if (typeof size === 'string' && size.includes("MB")) return size;
    const bytes = Number(size);
    if (isNaN(bytes) || bytes === 0) return size || "0 Bytes";
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchVideos = async () => {
    fetchedRef.current = true;
    try {
      const res = await api.get(`/files/${id}`);
      const data = res.data.data || res.data || [];
      setVideosData(Array.isArray(data) ? data : [data]);
    } catch { fetchedRef.current = false; }
  };

  useEffect(() => { if (id) fetchVideos(); }, [id, refreshTrigger]);

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
          {videosData.length > 0 ? videosData.map((v, idx) => (
            <tr key={v.id || idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className={tdCls}>{idx + 1}</td>
              <td className={tdCls}>
                <div className="flex items-center gap-2 cursor-pointer text-[#6c35de] hover:underline" onClick={() => setSelectedVideo(v)}>
                  <PlayCircleOutlineRoundedIcon fontSize="small" />
                  <span>{v.originalname || v.title || v.videoName || v.name || "Video"}</span>
                </div>
              </td>
              <td className={tdCls}>{v.lesson?.topic || v.lessonName || "-"}</td>
              <td className={tdCls}><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">{v.status || "Tayyor"}</span></td>
              <td className={tdCls + " text-slate-500"}>{v.lesson?.created_at ? formatDate(v.lesson.created_at) : v.lessonDate || "-"}</td>
              <td className={tdCls + " text-slate-500"}>{v.size_mb ? parseFloat(v.size_mb).toFixed(2) + ' MB' : formatFileSize(v.size || v.file_size)}</td>
              <td className={tdCls + " text-slate-500"}>{formatDate(v.created_at || v.addedTime)}</td>
              <td className={tdCls}><MoreVertRoundedIcon className="text-slate-400" fontSize="small" /></td>
            </tr>
          )) : (
            <tr><td colSpan="8" className="text-center py-8 text-slate-400 text-sm">Videolar topilmadi</td></tr>
          )}
        </tbody>
      </table>

      {selectedVideo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]" onClick={() => setSelectedVideo(null)}>
          <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden w-[800px] max-w-[95vw] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-white font-semibold text-sm">{selectedVideo.originalname || selectedVideo.title || selectedVideo.name || "Video"}</h2>
              <button onClick={() => setSelectedVideo(null)} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"><CloseRoundedIcon fontSize="small" /></button>
            </div>
            <VideoPlayer video={selectedVideo} base={FILE_BASE} />
          </div>
        </div>
      )}
    </>
  );
}
