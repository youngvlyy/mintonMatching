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


    //db에서 room 정보 불러오고 리스트에 뿌리기
    useEffect(() => {
        // 소켓 연결 (중복 방지)
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

        // 최초 로딩
        fetchRooms();

        // 서버에서 방 변경 알림
        socket.on("roomupdate", fetchRooms);

        return () => {
            socket.off("roomupdate", fetchRooms);
        };
    }, []);




    //방 추가 함수
    const addRoom = async (tit: string) => {
        const res = await axios.post("/api/room", {
            title: tit
        });
        //room menu
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

    //방으로 들어가기
    const inRoom = (id: string, tit: string) => {
        navigate(`/gameroom/${id}/${tit}?user=${socket.id}`);
    }


    // 검색된 방만 표시
    const filteredRooms = rooms.filter(room =>
        room.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-xl mx-auto min-h-screen bg-gray-50 px-4 py-6">
            {/* 헤더 */}
            <MainHeader />

            {/* 검색 */}
            <div className="mb-5">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="방 제목 검색"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300
                           focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
            </div>

            {/* 방 리스트 */}
            <div className="max-h-[450px] overflow-y-auto">
                <div className="space-y-2">
                    {filteredRooms.length === 0 && (
                        <p className="text-center text-sm text-gray-400 py-10">
                            생성된 방이 없습니다
                        </p>
                    )}

                    {filteredRooms.map((room) => (
                        <div
                            key={room._id}
                            onClick={() => inRoom(room._id, room.title)}
                            className="flex justify-between items-center px-4 py-4
                               bg-white border border-gray-200 rounded-xl
                               hover:bg-gray-50 transition cursor-pointer"
                        >
                            <span className="text-gray-800 font-medium truncate">
                                {room.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 방 생성 버튼 */}
            <button
                onClick={() => setOpenPopup(true)}
                className="fixed bottom-6 w-14 h-14 rounded-full
             flex items-center justify-center
             text-purple-500 border font-bold border-purple-500 leading-none text-3xl shadow-md
             hover:bg-purple-600 transition"
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
