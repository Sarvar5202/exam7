import { useEffect, useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import OndemandVideoRoundedIcon from '@mui/icons-material/OndemandVideoRounded';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import { 
  getMyGroups, 
  getMyGroupLessons, 
  getLessonVideos, 
  getLessonHomeworks, 
  submitHomeworkAnswer,
  getFileBlob,
  getUploadBlob
} from '../../api/studentApi';
import { getVideoUrl } from '../../utils/videoUtils';

// ─── Blob orqali video yuklash yordamchisi ───────────────────────────
async function fetchVideoBlob(filename) {
  try {
    const response = await getFileBlob(filename);
    return URL.createObjectURL(response.data);
  } catch {
    try {
      const response2 = await getUploadBlob(filename);
      return URL.createObjectURL(response2.data);
    } catch {
      return null;
    }
  }
}

// ─── Video Player Komponenti ─────────────────────────────────────────
function AccordionVideoPlayer({ vid, dark, border, textMain, textSub, lang }) {
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
      const url = await fetchVideoBlob(videoFileName);
      if (cancelled) return;
      if (url) {
        blobRef.current = url;
        setBlobUrl(url);
        setLoadingBlob(false);
      } else {
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
      marginBottom: 16,
    }}>
      {isYoutube ? (
        <iframe
          width="100%" height="320"
          src={videoFileName.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
          title={videoName}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : loadingBlob ? (
        <div style={{
          height: 180, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <CircularProgress size={24} style={{ color: '#6c35de' }} />
          <span style={{ color: textSub, fontSize: '0.78rem' }}>
            {lang === 'uz' ? 'Video yuklanmoqda...' : 'Загрузка видео...'}
          </span>
        </div>
      ) : error || !blobUrl ? (
        <div style={{
          height: 140, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <PlayCircleRoundedIcon style={{ fontSize: 32, color: '#ef4444' }} />
          <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
            {lang === 'uz' ? "Video yuklanmadi" : "Не удалось загрузить видео"}
          </span>
          <span style={{ color: textSub, fontSize: '0.72rem' }}>
            {lang === 'uz' ? "Server xatoligi yoki ruxsat yo'q" : "Ошибка сервера или нет доступа"}
          </span>
        </div>
      ) : (
        <video
          controls
          width="100%"
          style={{ display: 'block', maxHeight: 360, background: '#000' }}
        >
          <source src={blobUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      <div style={{
        padding: '12px 16px', borderTop: `1px solid ${border}`,
        fontSize: '0.85rem', fontWeight: 600, color: textMain,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <PlayCircleRoundedIcon style={{ fontSize: 16, color: '#6c35de' }} />
        {videoName}
      </div>
    </div>
  );
}

// ─── Accordion Qatori Komponenti ─────────────────────────────────────
function AccordionItem({ idx, lesson, selectedGroup, expanded, onToggle, dark, border, textMain, textSub, lang, setUploadModal }) {
  const [loadingContent, setLoadingContent] = useState(false);
  const [videos, setVideos] = useState([]);
  const [homeworks, setHomeworks] = useState([]);

  const title = lesson?.topic || lesson?.title || lesson?.name || `Dars ${idx + 1}`;
  const date = lesson?.created_at?.slice(0, 10) || lesson?.date || '';
  const lessonId = lesson?.id;
  const groupId = selectedGroup?.groupId || selectedGroup?.id;

  useEffect(() => {
    if (!expanded) return;
    
    async function loadLessonDetails() {
      setLoadingContent(true);
      try {
        const [vidRes, hwRes] = await Promise.all([
          getLessonVideos(groupId, lessonId).catch(() => ({ data: [] })),
          getLessonHomeworks(groupId, lessonId).catch(() => ({ data: [] }))
        ]);
        const vidData = vidRes.data?.data || vidRes.data || [];
        const hwData = hwRes.data?.data || hwRes.data || [];
        setVideos(Array.isArray(vidData) ? vidData : []);
        setHomeworks(Array.isArray(hwData) ? hwData : []);
      } catch {
        setVideos([]);
        setHomeworks([]);
      } finally {
        setLoadingContent(false);
      }
    }
    loadLessonDetails();
  }, [expanded, groupId, lessonId]);

  return (
    <div style={{ borderBottom: `1px solid ${border}` }}>
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          cursor: 'pointer',
          background: expanded ? (dark ? '#1a1a24' : '#fafafa') : 'transparent',
          transition: 'background 0.2s ease',
        }}
        onMouseEnter={(e) => { if (!expanded) e.currentTarget.style.background = dark ? '#13131e' : '#fcfcfc'; }}
        onMouseLeave={(e) => { if (!expanded) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ fontSize: '0.92rem', color: textMain, fontWeight: 500 }}>
          {idx + 1}. {title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: textSub, fontSize: '0.72rem' }}>
              <AccessTimeRoundedIcon style={{ fontSize: 13 }} />
              {date}
            </span>
          )}
          <KeyboardArrowDownRoundedIcon 
            style={{ 
              color: textSub, 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', 
              transition: 'transform 0.25s ease' 
            }} 
          />
        </div>
      </div>

      {/* Expanded Content Wrapper */}
      <div style={{
        maxHeight: expanded ? '2000px' : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{ padding: '20px', background: dark ? '#0d0d12' : '#fcfcff', borderTop: `1px solid ${border}` }}>
          {loadingContent ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <CircularProgress size={20} style={{ color: '#6c35de' }} />
            </div>
          ) : (
            <div>
              {/* Videos Section */}
              {videos.length > 0 ? (
                <div>
                  {videos.map((vid, vIdx) => (
                    <AccordionVideoPlayer
                      key={vid.id ?? vIdx}
                      vid={vid}
                      dark={dark}
                      border={border}
                      textMain={textMain}
                      textSub={textSub}
                      lang={lang}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0', color: textSub, fontSize: '0.85rem' }}>
                  {lang === 'uz' ? 'Video darsliklar mavjud emas.' : 'Видеоуроки отсутствуют.'}
                </div>
              )}

              {/* Homeworks Section */}
              {homeworks.length > 0 && (
                <div style={{ 
                  marginTop: 16, 
                  paddingTop: 16, 
                  borderTop: `1px dashed ${border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: textMain, margin: '0 0 4px' }}>
                    {lang === 'uz' ? 'Uy vazifalari:' : 'Домашние задания:'}
                  </h4>
                  {homeworks.map((hw, hIdx) => (
                    <div key={hw.id ?? hIdx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: dark ? '#161622' : '#f0f4ff',
                      padding: '12px 16px',
                      borderRadius: 10,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AssignmentRoundedIcon style={{ color: '#6c35de', fontSize: 18 }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: textMain }}>
                          {hw.title || (lang === 'uz' ? 'Uy vazifasi' : 'Домашнее задание')}
                        </span>
                      </div>
                      <button
                        onClick={() => setUploadModal({ homeworkId: hw.id, lessonTitle: title })}
                        style={{
                          padding: '6px 14px', borderRadius: 8,
                          background: '#6c35de', border: 'none',
                          color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 6,
                          boxShadow: '0 4px 10px rgba(108, 53, 222, 0.25)',
                          transition: 'transform 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        {lang === 'uz' ? 'Topshirish' : 'Сдать'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Asosiy Komponent ────────────────────────────────────────────────
export default function StudentExtraLessons() {
  const { dark, lang } = useApp();

  const cardBg   = dark ? '#111118' : '#ffffff';
  const border   = dark ? '#1e1e2a' : '#f0f0f5';
  const textMain = dark ? '#e0e0f0' : '#1e293b';
  const textSub  = dark ? '#8888aa' : '#64748b';

  const [groups, setGroups] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expandedLessonId, setExpandedLessonId] = useState(null);

  // Uy vazifasi yuborish state
  const [uploadModal, setUploadModal] = useState(null); // { homeworkId, lessonTitle }
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const grRes  = await getMyGroups();
        const grData = grRes.data?.data || grRes.data || [];
        const grArr  = Array.isArray(grData) ? grData : [];
        setGroups(grArr);

        if (grArr.length > 0) {
          const group   = grArr[0]?.group || grArr[0];
          const groupId = group?.groupId || group?.id;
          setSelectedGroup(group);
          if (groupId) {
            const lRes  = await getMyGroupLessons(groupId);
            const lData = lRes.data?.data || lRes.data || [];
            setLessons(Array.isArray(lData) ? lData : []);
          }
        }
      } catch {
        setLessons([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleGroupChange(groupId) {
    const grp = groups.find(g => (g?.group?.groupId || g?.groupId || g?.group?.id || g?.id) === Number(groupId));
    setSelectedGroup(grp?.group || grp);
    setLoading(true);
    setExpandedLessonId(null);
    try {
      const lRes  = await getMyGroupLessons(groupId);
      const lData = lRes.data?.data || lRes.data || [];
      setLessons(Array.isArray(lData) ? lData : []);
    } catch {
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitHomework(e) {
    e.preventDefault();
    if (!uploadFile || !uploadModal?.homeworkId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', uploadTitle || uploadModal.lessonTitle || 'Homework');
      fd.append('file', uploadFile);
      await submitHomeworkAnswer(uploadModal.homeworkId, fd);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadModal(null);
        setUploadSuccess(false);
        setUploadFile(null);
        setUploadTitle('');
      }, 1500);
    } catch {
      // xatolik
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="pt-6 flex flex-col gap-6">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: textMain, margin: 0 }}>
          {selectedGroup?.groupName || selectedGroup?.name || (lang === 'uz' ? "Kurs" : 'Курс')}
        </h1>

        {/* Guruh tanlash dropdown */}
        {groups.length > 1 && (
          <select
            onChange={e => handleGroupChange(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 10, fontSize: '0.85rem',
              background: cardBg, border: `1px solid ${border}`,
              color: textMain, cursor: 'pointer', outline: 'none',
            }}
          >
            {groups.map((g, i) => {
              const gr = g?.group || g;
              return (
                <option key={i} value={gr?.groupId || gr?.id}>
                  {gr?.groupName || gr?.name || `Guruh ${i + 1}`}
                </option>
              );
            })}
          </select>
        )}
      </div>

      {/* Accordion container */}
      {loading ? (
        <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${border}`, padding: '10px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} variant="text" height={52} sx={{ margin: '8px 12px', borderRadius: 1 }} />
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <div style={{
          background: cardBg, borderRadius: 12, border: `1px solid ${border}`,
          padding: '60px 20px', textAlign: 'center',
        }}>
          <OndemandVideoRoundedIcon style={{ fontSize: 48, color: textSub, marginBottom: 12 }} />
          <p style={{ color: textSub, fontSize: '0.9rem' }}>
            {lang === 'uz' ? "Darslar topilmadi" : "Уроки не найдены"}
          </p>
        </div>
      ) : (
        <div style={{
          background: cardBg,
          borderRadius: 12,
          border: `1px solid ${border}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}>
          {lessons.map((lesson, idx) => (
            <AccordionItem
              key={lesson.id ?? idx}
              idx={idx}
              lesson={lesson}
              selectedGroup={selectedGroup}
              expanded={expandedLessonId === lesson.id}
              onToggle={() => setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)}
              dark={dark}
              border={border}
              textMain={textMain}
              textSub={textSub}
              lang={lang}
              setUploadModal={setUploadModal}
            />
          ))}
        </div>
      )}

      {/* Uy vazifasi upload modali */}
      {uploadModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }}
          onClick={e => { if (e.target === e.currentTarget) setUploadModal(null); }}
        >
          <div style={{
            background: cardBg, borderRadius: 20, padding: '28px',
            width: '100%', maxWidth: 440,
            border: `1px solid ${border}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: textMain, marginBottom: 6 }}>
              {lang === 'uz' ? 'Uy vazifasi topshirish' : 'Сдать домашнее задание'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: textSub, marginBottom: 20 }}>
              {uploadModal.lessonTitle}
            </p>

            {uploadSuccess ? (
              <div style={{
                textAlign: 'center', padding: '20px',
                color: '#22c55e', fontWeight: 700, fontSize: '1rem',
              }}>
                ✅ {lang === 'uz' ? 'Muvaffaqiyatli topshirildi!' : 'Успешно сдано!'}
              </div>
            ) : (
              <form onSubmit={handleSubmitHomework} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: textSub, display: 'block', marginBottom: 6 }}>
                    {lang === 'uz' ? 'Sarlavha' : 'Заголовок'}
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={e => setUploadTitle(e.target.value)}
                    placeholder={uploadModal.lessonTitle}
                    style={{
                      width: '100%', height: 42, padding: '0 12px', borderRadius: 10,
                      border: `1px solid ${border}`, background: dark ? '#16161f' : '#f8fafc',
                      color: textMain, fontSize: '0.88rem', outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: textSub, display: 'block', marginBottom: 6 }}>
                    {lang === 'uz' ? 'Fayl' : 'Файл'} *
                  </label>
                  <input
                    type="file"
                    required
                    onChange={e => setUploadFile(e.target.files[0])}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 10,
                      border: `1px solid ${border}`, background: dark ? '#16161f' : '#f8fafc',
                      color: textMain, fontSize: '0.85rem', cursor: 'pointer',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setUploadModal(null)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 10, fontWeight: 600,
                      background: dark ? '#16161f' : '#f1f5f9',
                      border: `1px solid ${border}`, color: textMain,
                      cursor: 'pointer', fontSize: '0.88rem',
                    }}
                  >
                    {lang === 'uz' ? 'Bekor' : 'Отмена'}
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 10, fontWeight: 700,
                      background: uploading ? '#64748b' : '#6c35de',
                      border: 'none', color: '#fff',
                      cursor: uploading || !uploadFile ? 'not-allowed' : 'pointer',
                      fontSize: '0.88rem', transition: 'all 0.2s',
                    }}
                  >
                    {uploading ? '...' : (lang === 'uz' ? 'Yuborish' : 'Отправить')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
