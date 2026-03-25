import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { socket } from "../util/socket";
import Popup from "../component/Popup";
import type { PopupMode } from "../component/type/config";
import { MainHeader } from "../component/Header";

interface Room {
    _id: string;
    title: string;
}
const Main = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [search, setSearch] = useState("");
    const [openPopup, setOpenPopup] = useState(false);
    const mode: PopupMode = "roomMake";

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        const fetchRooms = () => {
            axios.get("/api/room")
                .then(res => {
                    setRooms(res.data);
                    console.log(res.data);
                })
                .catch(err => console.log(err));
        };

        fetchRooms();

        socket.on("roomupdate", fetchRooms);

        return () => {
            socket.off("roomupdate", fetchRooms);
        };
    }, []);

    const addRoom = async (tit: string) => {
        const res = await axios.post("/api/room", {
            title: tit
        });
        setRooms(prev => [
            ...prev,
            {
                _id: res.data._id,
                title: res.data.title
            }
        ]);
        console.log("res.data", res.data);
        socket.emit("makeRoom");
        return res.data;
    };

    const inRoom = (id: string, tit: string) => {
        navigate(`/gameroom/${id}/${tit}?user=${socket.id}`);
    }

    const filteredRooms = rooms.filter(room =>
        room.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-xl mx-auto min-h-screen bg-slate-50 px-4 py-6">
            {/* 헤더 */}
            <MainHeader />

            {/* 검색 */}
            <div className="mb-5">
                <div className="relative">
                    <svg
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="방 제목 검색"
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200
                               bg-white focus:outline-none focus:ring-2 focus:ring-violet-400
                               focus:border-transparent placeholder:text-slate-400 shadow-sm transition"
                    />
                </div>
            </div>

            {/* 방 리스트 */}
            <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-0.5">
                {filteredRooms.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <span className="text-4xl mb-3">🏸</span>
                        <p className="text-sm font-medium">아직 생성된 방이 없어요</p>
                        <p className="text-xs mt-1">아래 + 버튼으로 방을 만들어보세요</p>
                    </div>
                )}

                {filteredRooms.map((room) => (
                    <div
                        key={room._id}
                        onClick={() => inRoom(room._id, room.title)}
                        className="flex justify-between items-center px-5 py-4
                           bg-white border border-slate-200 rounded-2xl
                           hover:border-violet-300 hover:shadow-md transition cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
                                <span className="text-base">🏟️</span>
                            </div>
                            <span className="text-slate-800 font-semibold text-sm truncate">
                                {room.title}
                            </span>
                        </div>
                        <svg
                            className="text-slate-300 group-hover:text-violet-400 transition"
                            width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </div>
                ))}
            </div>

            {/* 방 생성 버튼 */}
            <button
                onClick={() => setOpenPopup(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl
                 flex items-center justify-center
                 bg-violet-600 text-white font-bold text-2xl shadow-lg shadow-violet-200
                 hover:bg-violet-700 active:scale-95 transition-all"
            >
                +
            </button>

            {openPopup && (
                <Popup
                    mode={mode}
                    close={() => setOpenPopup(false)}
                    addRoom={(tit) => addRoom(tit)}
                    inRoom={(id, tit) => inRoom(id, tit)}
                />
            )}
        </div>
    );
};

export default Main;
