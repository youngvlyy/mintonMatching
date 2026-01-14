import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { socket } from "../util/socket"

interface Player {
    userid: string;
    name: string;
    gender: "M" | "F";
}

export default function GameRoom() {
    const navigate = useNavigate();
    const [courtCount, setCourtCount] = useState(3);
    const { roomid, roomtit } = useParams();
    const [searchparams] = useSearchParams();
    const userid = searchparams.get("user");
    console.log(userid);
    const [courts, setCourts] = useState<Player[][] | null>(null);
    const [resting, setResting] = useState<Player[]>([]);
    const [ready, setReady] = useState<Player[] | null>(null);
    const [isAlreadyReady, setisAlreadyReady] = useState(false);


    // 샘플 참가자
    const [players, setPlayers] = useState<Player[]>([]);

    //소켓 연결 함수
    const onConnect = () => {
        console.log("연결됨:", socket.id);
        socket.emit("joinRoom", roomid, userid);
    };
    //소켓 끊기
    const handleUnload = () => {
        socket.emit("leaveRoom", roomid, userid);

    };
    useEffect(() => {
        if (!roomid || !userid) return;

        //화면전환시 재접속
        if (!socket.connected) socket.connect();

        socket.on("connect", onConnect);

        // 방 참여 (이미 연결되어 있을때)
        onConnect();

        // 서버에서 참여자 수신
        socket.on("inupdatePlayers", (players) => {
            setPlayers(players);
        });

        //서버에서 퇴장자 수신
        socket.on("outupdatePlayer", (players) => {
            setPlayers(players);
        });

        //readyplayer 화면에 뿌려주기
        socket.on("readyPlayers", (readyPlayers) => {
            setReady(readyPlayers);
        });
        socket.on("initreadyPlayers", ({ readyPlayers, isready }) => {
            setReady(readyPlayers);
            setisAlreadyReady(isready);
        });


        socket.on("matchingPlayers", ({ courts, resting }) => {
            setCourts(courts);
            setResting(resting);
        });

        socket.on("matchingAlert", (message) => {
            alert(message);
        });

        // 새로고침 / 탭 닫기
        window.addEventListener("beforeunload", handleUnload);

        return () => {
            //페이지가 사라질때 clean up
            socket.off("inupdatePlayers");
            socket.off("outupdatePlayer");
            socket.off("readyPlayers");
            socket.off("matchingPlayers");
        };
    }, [roomid, userid]);

    const exit = () => {
        socket.emit("leaveRoom", roomid, userid);
        navigate(`/?user=${userid}`);
    }

    //참여자들 랜덤하게 섞는 함수
    function shuffle<T>(array: T[]) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // 0~i-1 인덱스 만듬
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }



    //매칭 함수
    const matchPlayers = (players: Player[], courtCount: number) => {
        let males = [...players.filter((p) => p.gender === "M")];
        let females = [...players.filter((p) => p.gender === "F")];

        //인원수가 모자르면 stop
        if (males.length + females.length < 4) {
            alert("ready인원수 모자람");
            return;
        }

        //배열 섞기
        males = shuffle(males);
        females = shuffle(females);

        //화면에 뿌려짐 배열 초기화
        const newCourts: Player[][] = [];

        for (let i = 0; i < courtCount; i++) {
            const group: Player[] = [];

            // 우선 2M 2F 조합
            if (males.length >= 2 && females.length >= 2) {
                group.push(...males.splice(0, 2));
                group.push(...females.splice(0, 2));
            }
            // 3M 1F
            else if (males.length >= 3 && females.length >= 1) {
                group.push(...males.splice(0, 3));
                group.push(...females.splice(0, 1));
            }
            // 1M 3F
            else if (females.length >= 3 && males.length >= 1) {
                group.push(...females.splice(0, 3));
                group.push(...males.splice(0, 1));
            }
            // 안 되면 그냥 4명
            else {
                const leftover = [...males, ...females];
                if (leftover.length < 4) break; // 팀 불가 시 종료
                group.push(...leftover.splice(0, 4));
            }

            newCourts.push(group);

            //뽑힌 사람은 삭제
            group.find((p) => {
                males = males.filter(m => m !== p)
                females = females.filter(f => f !== p)
            })
        }

        // 남는 사람들은 쉬는 타임
        const rest: Player[] = [...males, ...females];


        socket.emit("matching", roomid, newCourts, rest);

        //대기열 플레이어 비우기
        socket.emit("emptyready", roomid);
    }

    //대기열 플레이어
    const readyPlayers = (userid: string | null) => {
        if (!userid) return;

        //중복방지
        if (ready && isAlreadyReady) {
            let newready = [...ready.filter((r) => r.userid !== userid)]
            setReady(newready);
            socket.emit("notready", roomid, userid);
        }
        else {
            socket.emit("ready", roomid, userid);
        };

        setisAlreadyReady(!isAlreadyReady);
    };




    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            {/* 헤더 */}
            <div className="relative flex items-center justify-center">
                <button
                    type="button"
                    onClick={exit}
                    className="absolute left-0 px-3 py-1 text-sm border rounded-lg hover:bg-gray-100"
                >
                    뒤로
                </button>

                <h1 className="text-2xl font-bold">
                    {roomtit}
                </h1>
            </div>

            {/* Court Count */}
            <div className="flex items-center justify-center gap-6 bg-gray-50 p-4 rounded-xl">
                <button
                    onClick={() => setCourtCount((c) => Math.max(1, c - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100"
                > -
                </button>

                <span className="text-lg font-semibold">
                    {courtCount} 코트
                </span>

                <button
                    onClick={() => setCourtCount((c) => c + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100"
                >
                    +
                </button>
            </div>

            {/* Players */}
            <div className="bg-white rounded-xl shadow p-5">
                <h2 className="text-lg font-semibold mb-3">
                    참가자 목록 <span className="text-gray-500">({players.length})</span>
                </h2>

                <ul className="space-y-2">
                    {players.map((p) => (
                        <li
                            key={p.userid}
                            className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-50"
                        >
                            <span className="font-medium">
                                {p.name}
                                <span className="text-sm text-gray-400 ml-1">
                                    ({p.userid})
                                </span>
                            </span>
                            <span className="text-sm px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
                                {p.gender}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 매칭버튼 */}
            <div className="flex justify-center gap-4">
                <button
                    type="button"
                    disabled={!isAlreadyReady}
                    onClick={() => ready? matchPlayers(ready, courtCount): null}
                    className={`px-6 py-2 rounded-lg font-semibold transition
                ${isAlreadyReady
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    매칭 시작
                </button>

                <button
                    type="button"
                    onClick={() => readyPlayers(userid)}
                    className={`px-6 py-2 rounded-lg font-semibold border transition
                ${isAlreadyReady
                            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                            : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                        }`}
                >
                    {isAlreadyReady ? "Ready 취소" : "Ready"}
                </button>
            </div>

            {/* 대기열 */}
            <div className="bg-white rounded-xl shadow p-5">
                <h3 className="font-semibold mb-3">
                    대기열 <span className="text-gray-500">({ready ? ready.length : 0})</span>
                </h3>

                <ul className="space-y-1">
                    {ready?.map((p) => (
                        <li key={p.userid} className="px-3 py-1 rounded hover:bg-gray-50">
                            {p.name} ({p.gender})
                        </li>
                    ))}
                </ul>
            </div>

            {/* 매칭 코트 */}
            <div className={courts ? "bg-white rounded-xl shadow p-5 space-y-4" : "hidden"}>
                <h2 className="text-xl font-semibold">매칭 결과</h2>

                {courts?.map((court, idx) => (
                    <div key={idx} className="border rounded-lg p-3">
                        <h3 className="font-semibold mb-2 text-indigo-600">
                            Court {idx + 1}
                        </h3>
                        <ul className="space-y-1">
                            {court.map((p) => (
                                <li key={p.userid}>
                                    {p.name} ({p.gender})
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div className="border rounded-lg p-3 bg-gray-50">
                    <h3 className="font-semibold mb-2">
                        쉬는 사람들 <span className="text-gray-500">({resting?.length})</span>
                    </h3>
                    <ul className="space-y-1">
                        {resting?.map((p) => (
                            <li key={p.userid}>
                                {p.name} ({p.gender})
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

    );
}


