import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import { api } from "../../../api/api";
import ConfirmDialog from "../../../components/UI/ConfirmDialog/ConfirmDialog";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function ArchiveRooms() {
  const navigate = useNavigate();
  const [rooms, setRooms]         = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState({ isOpen: false, roomId: null });

  const fetchArchivedRooms = () => {
    setIsLoading(true);
    api.get('/rooms/arxive')
      .then(res => setRooms(res.data.data || []))
      .catch(err => console.log(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchArchivedRooms(); }, []);

  const actualRestoreRoom = (id) => {
    setIsLoading(true);
    api.post(`/rooms/${id}/restore`)
      .then(() => setRooms(prev => prev.filter(r => r.id !== id)))
      .catch(err => alert("Xatolik: " + (err.response?.data?.message || err.message)))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/management/rooms')}
          className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <KeyboardArrowLeftRoundedIcon fontSize="small" />
        </button>
        <h2 className="text-lg font-bold text-slate-900">Xonalar (Arxiv)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 relative" style={{ opacity: isLoading ? 0.6 : 1, minHeight: 100 }}>
        {isLoading && (
          <Box sx={{ position:'absolute', inset:0, display:'flex', justifyContent:'center', alignItems:'center', backgroundColor:'rgba(255,255,255,0.5)', zIndex:10 }}>
            <CircularProgress sx={{ color: '#6c35de' }} />
          </Box>
        )}
        {!isLoading && rooms.length === 0 && (
          <p className="text-sm text-slate-400 col-span-3 py-8 text-center">Arxivlangan xonalar yo'q</p>
        )}
        {rooms.map(room => (
          <div key={room.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm opacity-70">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900">{room.name}</h3>
              <button
                onClick={() => setRestoreConfirm({ isOpen: true, roomId: room.id })}
                className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Tiklash"
              >
                <RestoreOutlinedIcon fontSize="small" />
              </button>
            </div>
            <p className="text-sm text-slate-500">Sig'imi: <span className="font-semibold text-slate-800">{room.capacity}</span></p>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={restoreConfirm.isOpen}
        onClose={() => setRestoreConfirm({ isOpen: false, roomId: null })}
        onConfirm={() => { const id = restoreConfirm.roomId; setRestoreConfirm({ isOpen: false, roomId: null }); actualRestoreRoom(id); }}
        title="Xonani tiklash"
        message="Ushbu xonani arxivdan tiklashni xohlaysizmi?"
      />
    </div>
  );
}
