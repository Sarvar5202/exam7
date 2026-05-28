import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import RoomModal from "../../../components/UI/RoomModal/RoomModal";
import ConfirmDialog from "../../../components/UI/ConfirmDialog/ConfirmDialog";
import { api } from "../../../api/api";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const inputCls = "w-full h-10 px-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6c35de] focus:ring-2 focus:ring-[#6c35de]/20 outline-none transition-all";
const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

export default function Rooms() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const defaultData = { name: "", capacity: "" };
  const [roomData, setRoomData] = useState(defaultData);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, roomId: null });

  const fetchRooms = () => {
    setIsLoading(true);
    api.get('/rooms').then(res => setRooms(res.data.data)).catch(err => console.log(err.message)).finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleChange = (e) => setRoomData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const openAdd = () => { setSelectedRoom(null); setRoomData(defaultData); setIsModalOpen(true); };
  const openEdit = (r) => { setSelectedRoom(r); setRoomData({ name: r.name || "", capacity: r.capacity?.toString() || "" }); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedRoom(null); setRoomData(defaultData); };

  function deleteRoom(id) {
    setIsLoading(true);
    api.delete(`/rooms/${id}`).then(res => { if (res.status === 200 || res.status === 204) setRooms(prev => prev.filter(r => r.id !== id)); }).catch(err => console.error(err.message)).finally(() => setIsLoading(false));
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Xonalar</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/management/rooms/archive')} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
            <ArchiveOutlinedIcon fontSize="small" />Arxiv
          </button>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#6c35de] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#5a2cc0] transition-colors">
            <AddRoundedIcon fontSize="small" />Xonani qo'shish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 relative" style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.2s', minHeight: 100 }}>
        {isLoading && <Box sx={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 10 }}><CircularProgress sx={{ color: '#6c35de' }} /></Box>}
        {rooms.map(room => (
          <div key={room.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">{room.name}</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => setDeleteConfirm({ isOpen: true, roomId: room.id })} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors"><DeleteOutlineRoundedIcon fontSize="small" /></button>
                <button onClick={() => openEdit(room)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-[#6c35de] hover:bg-slate-100 rounded-lg transition-colors"><EditOutlinedIcon fontSize="small" /></button>
              </div>
            </div>
            <p className="text-sm text-slate-500">Sig'imi: <span className="font-semibold text-slate-800">{room.capacity}</span></p>
          </div>
        ))}
      </div>

      <RoomModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedRoom ? "Xonani tahrirlash" : "Xonani qo'shish"}
        footer={
          <>
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Bekor qilish</button>
            <button type="submit" form="roomForm" className="px-4 py-2 text-sm font-semibold text-white bg-[#6c35de] rounded-lg hover:bg-[#5a2cc0] transition-colors">Saqlash</button>
          </>
        }
      >
        <form id="roomForm" onSubmit={(e) => {
          e.preventDefault();
          const payload = { name: roomData.name, capacity: Number(roomData.capacity) };
          const req = selectedRoom ? api.patch(`/rooms/${selectedRoom.id}`, payload) : api.post('/rooms', payload);
          req.then(() => { fetchRooms(); closeModal(); }).catch(err => console.log(err.message));
        }} className="flex flex-col gap-4">
          <div><label className={labelCls}>Nomi <span className="text-red-500">*</span></label><input value={roomData.name} onChange={handleChange} name="name" type="text" placeholder="Xona nomi" className={inputCls} /></div>
          <div><label className={labelCls}>Sig'imi <span className="text-red-500">*</span></label><input value={roomData.capacity} onChange={handleChange} name="capacity" type="number" placeholder="Masalan: 20" className={inputCls} /></div>
        </form>
      </RoomModal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, roomId: null })}
        onConfirm={() => { const id = deleteConfirm.roomId; setDeleteConfirm({ isOpen: false, roomId: null }); deleteRoom(id); }}
        title="Xonani o'chirish"
        message="Rostdan ham o'chirishni hohlaysizmi?"
      />
    </div>
  );
}
