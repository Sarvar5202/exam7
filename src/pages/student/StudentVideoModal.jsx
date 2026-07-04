import { useState, useEffect, useRef } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import { getLessonVideos, getFileBlob, getUploadBlob } from '../../api/studentApi';
import { getVideoUrl } from '../../utils/videoUtils';
import CircularProgress from '@mui/material/CircularProgress';

// Blob orqali video yuklab olish (authenticated student)
async function fetchVideoBlob(filename) {
  try {
    const response = await getFileBlob(filename);
    return URL.createObjectURL(response.data);
  } catch {
    // Boshqa URL pattern sinab ko'ramiz
    try {
      const response2 = await getUploadBlob(filename);
      return URL.createObjectURL(response2.data);
    } catch {
      return null;
    }
  }
}

function VideoPlayer({ vid, dark, border, textMain, textSub, lang }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loadingBlob, setLoadingBlob] = useState(true);
  const [error, setError] = useState(false);
  const blobRef = useRef(null);

  const videoName = vid.originalname || vid.name || 'Video';
  const videoFileName = vid.video_url || vid.url || vid.filename || vid.file;
  const isYoutube = videoFileName && (videoFileName.includes('youtube.com') || videoFileName.includes('youtu.be'));

  useEffect(() => {
    if (isYoutube) { setLoadingBlob(false); return; }
    if (!videoFileName) { setLoadingBlob(false); setError(true); return; }

    let cancelled = false;
    setLoadingBlob(true);
    setError(false);
    setBlobUrl(null);

    (async () => {
      // Try blob fetch first (authenticated route)
      const url = await fetchVideoBlob(videoFileName);
      if (cancelled) return;
      if (url) {
        blobRef.current = url;
        setBlobUrl(url);
        setLoadingBlob(false);
      } else {
        // If blob fetch fails, try direct URL as fallback
        const directUrl = getVideoUrl(videoFileName);
        if (directUrl) {
          setBlobUrl(directUrl);
          setLoadingBlob(false);
        } else {
          setError(true);
          setLoadingBlob(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (blobRef.current && blobRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, [videoFileName, isYoutube]);

  return (
    <div style={{
      background: dark ? '#16161f' : '#f8fafc',
      borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${border}`,
    }}>
      {isYoutube ? (
        <iframe
          width="100%" height="300"
          src={videoFileName.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
          title={videoName}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : loadingBlob ? (
        <div style={{
          height: 200, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <CircularProgress size={28} style={{ color: '#6c35de' }} />
          <span style={{ color: textSub, fontSize: '0.78rem' }}>
            {lang === 'uz' ? 'Video yuklanmoqda...' : 'Загрузка видео...'}
          </span>
        </div>
      ) : error || !blobUrl ? (
        <div style={{
          height: 160, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <PlayCircleRoundedIcon style={{ fontSize: 36, color: '#ef4444' }} />
          <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
            {lang === 'uz' ? "Video yuklanmadi" : "Не удалось загрузить"}
          </span>
          <span style={{ color: textSub, fontSize: '0.72rem', textAlign: 'center', padding: '0 12px' }}>
            {lang === 'uz' ? "Server xatoligi yoki ruxsat yo'q" : "Ошибка сервера или нет доступа"}
          </span>
        </div>
      ) : (
        <video
          controls
          width="100%"
          style={{ display: 'block', maxHeight: 340, background: '#000' }}
        >
          <source src={blobUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      <div style={{
        padding: '10px 16px', borderTop: `1px solid ${border}`,
        fontSize: '0.85rem', fontWeight: 600, color: textMain,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <PlayCircleRoundedIcon style={{ fontSize: 16, color: '#6c35de' }} />
        {videoName}
      </div>
    </div>
  );
}

export default function StudentVideoModal({ lesson, onClose, dark, lang, cardBg, border, textMain, textSub }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await getLessonVideos(lesson.groupId, lesson.lessonId);
        const data = res.data?.data || res.data || [];
        setVideos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Video yuklashda xatolik:", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, [lesson]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: '16px', backdropFilter: 'blur(6px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: cardBg, borderRadius: 20, padding: '24px',
        width: '100%', maxWidth: 720,
        border: `1px solid ${border}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: textMain, margin: '0 0 4px' }}>
              {lesson.lessonTitle}
            </h3>
            <p style={{ fontSize: '0.82rem', color: textSub, margin: 0 }}>
              {lang === 'uz' ? 'Dars videolari' : 'Видео урока'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: dark ? '#2a2a3a' : '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: textSub, border: 'none', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <CircularProgress size={30} style={{ color: '#6c35de' }} />
            </div>
          ) : videos.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: textSub, fontSize: '0.9rem' }}>
              <PlayCircleRoundedIcon style={{ fontSize: 48, color: textSub, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
              {lang === 'uz' ? 'Ushbu dars uchun video topilmadi.' : 'Видео для этого урока не найдено.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {videos.map((vid, idx) => (
                <VideoPlayer
                  key={vid.id ?? idx}
                  vid={vid}
                  dark={dark}
                  border={border}
                  textMain={textMain}
                  textSub={textSub}
                  lang={lang}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
