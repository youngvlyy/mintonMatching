import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../util/socket"
import {Header} from "../component/Header";

interface Player {
    userid: string;
    name: string;
    gender: "M" | "F";
}

interface GameRoomP{
    userid:string;
}

export default function GameRoom({userid}:GameRoomP) {
    const navigate = useNavigate();
    const [courtCount, setCourtCount] = useState(3);
    const { roomid, roomtit } = useParams();
    console.log(userid);
    const [courts, setCourts] = useState<Player[][] | null>(null);
    const [resting, setResting] = useState<Player[]>([]);
    const [ready, setReady] = useState<Player[] | null>(null);
    const [isAlreadyReady, setisAlreadyReady] = useState(false);
    const [matchingcount, setMatchingcount] = useState(0);

    const [players, setPlayers] = useState<Player[]>([]);

    const onConnect = () => {
        console.log("연결됨:", socket.id);
        socket.emit("joinRoom", roomid, userid);
    };
    const handleUnload = () => {
        socket.emit("leaveRoom", roomid, userid);
    };
    useEffect(() => {
        if (!roomid || !userid) return;

        if (!socket.connected) socket.connect();

        socket.on("connect", onConnect);
        onConnect();

        socket.on("inupdatePlayers", (players) => {
            setPlayers(players);
        });

        socket.on("outupdatePlayer", async (players) => {
            setPlayers(players);
        });

        socket.on("isready", (isready) => {
            setisAlreadyReady(isready === "1");
        });

        socket.on("readyPlayers", (readyPlayers) => {
            setReady(readyPlayers);
        });
        socket.on("initreadyPlayers", ({ readyPlayers, f }) => {
            setReady(readyPlayers);
            setisAlreadyReady(f);
        });

        socket.on("matchingPlayers", (matching) => {
            setCourts(matching?.courts);
            setResting(matching.resting);
            setMatchingcount(matching.matchingcount);
            console.log("matchingcount", matchingcount);
        });
        socket.on("matchingAlert", (message) => {
            alert(message);
        });

        socket.on("ex",()=>{
            navigate(`/`);
        })

        window.addEventListener("beforeunload", handleUnload);

        return () => {
            socket.off("connect", onConnect);
            socket.off("inupdatePlayers");
            socket.off("outupdatePlayer");
            socket.off("readyPlayers");
            socket.off("matchingPlayers");
            socket.off("matchingAlert");
            socket.off("initreadyPlayers");
        };

    }, [roomid, userid]);


    const exit = () => {
        socket.emit("leaveRoom", roomid, userid);
        navigate(`/`);
    }

    function shuffle<T>(array: T[]) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function shuffle2A<T>(array: T[][], groupSize: number): T[][] {
        const flat = shuffle(array.flat());
        const result: T[][] = [];
        for (let i = 0; i < flat.length; i += groupSize) {
            result.push(flat.slice(i, i + groupSize));
        }
        return result;
    }

    let noReady: Player[] = [...players.filter(p => ready?.some(r => p.userid !== r.userid))];

    const matchPlayers = (players: Player[], courtCount: number) => {
        let restReady: Player[] = [...players.filter(p =>
            resting.some(r => p.userid === r.userid)
        )];
        if (players.length < 4) {
            alert("ready인원수 모자람");
            return;
        }

        let newCourts: Player[][] = [];
        console.log("restReady", restReady);

        let rmales = [...players.filter((p) => p.gender === "M" && restReady.some(r => r.userid === p.userid))];
        let rfemales = [...players.filter((p) => p.gender === "F" && restReady.some(r => r.userid === p.userid))];
        let males = [...players.filter((p) => p.gender === "M" && !restReady.some(r => r.userid === p.userid))];
        let females = [...players.filter((p) => p.gender === "F" && !restReady.some(r => r.userid === p.userid))];

        rmales = shuffle(rmales);
        rfemales = shuffle(rfemales);
        males = shuffle(males);
        females = shuffle(females);

        males.unshift(...rmales);
        females.unshift(...rfemales);

        let rest: Player[] = [];
        let localMatchingCount = matchingcount;
        let sumMf:any[] = [];
        let sumRmf :any[] = [];
        let arr :any[] = [];

        for (let i = 0; i < courtCount; i++) {
            const group: Player[] = [];

            if (males.length >= 2 && females.length >= 2 && localMatchingCount < 3) {
                group.push(...males.splice(0, 2));
                group.push(...females.splice(0, 2));
                localMatchingCount++;
            }
            else if (males.length >= 4) {
                localMatchingCount++;
                group.push(...males.splice(0, 4));
            }
            else if (females.length >= 4) {
                localMatchingCount++;
                group.push(...females.splice(0, 4));
            }
            else {
                arr = [];
                sumMf = [...males,...females];
                sumRmf = [...rfemales, ...rmales];

                sumRmf = shuffle(sumRmf);
                sumMf = shuffle(sumMf);

                if (males.length + females.length < 4) break;
                localMatchingCount = 0;

                while (arr.length !== 4 && (sumRmf.length > 0 || sumMf.length > 0)) {
                    if(sumRmf.length){
                        let grap: any = sumRmf.splice(0,1)[0];
                        arr.push(grap);
                        males = [...males.filter(m=> m.userid !== grap.userid)];
                        females = [...females.filter(m=> m.userid !== grap.userid)];
                        sumMf = [...sumMf.filter(m=> m.userid !== grap.userid)];
                    }else {
                        let grap: any = sumMf.splice(0,1)[0];
                        arr.push(grap);
                        males = [...males.filter(m=> m.userid !== grap.userid)];
                        females = [...females.filter(m=> m.userid !== grap.userid)];
                    }
                }

                group.push(...arr.splice(0));
            }

            newCourts.push(group);
        }

        newCourts = shuffle2A(newCourts, 4);
        console.log("newCourts", newCourts);

        rest = [...males,...females];
        console.log("rest2", rest);

        socket.emit("matching", roomid, newCourts, rest, localMatchingCount);
        rest = [...rest, ...noReady];
    }

    const readyPlayers = (userid: string | null) => {
        if (!userid) return;
        if (ready && isAlreadyReady) {
            socket.emit("notready", roomid, userid);
        } else {
            socket.emit("ready", roomid, userid);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 min-h-screen bg-slate-50">
            {/* 헤더 */}
            <div className="page-card">
                <Header exit={exit} title={roomtit}/>
            </div>

            {/* 코트 수 조절 */}
            <div className="page-card">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">코트 수</p>
                <div className="flex items-center justify-center gap-6">
                    <button
                        onClick={() => setCourtCount((c) => Math.max(1, c - 1))}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100
                                   hover:bg-slate-200 text-slate-700 font-bold text-lg active:scale-95 transition"
                    >
                        −
                    </button>
                    <div className="text-center">
                        <span className="text-3xl font-bold text-slate-900">{courtCount}</span>
                        <span className="text-slate-500 text-sm ml-1.5">코트</span>
                    </div>
                    <button
                        onClick={() => setCourtCount((c) => c + 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100
                                   hover:bg-slate-200 text-slate-700 font-bold text-lg active:scale-95 transition"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* 참가자 목록 */}
            <div className="page-card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-700">참가자 목록</h2>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                        {players.length}명
                    </span>
                </div>

                <ul className="space-y-2">
                    {players.map((p) => (
                        <li
                            key={p.userid}
                            className="flex justify-between items-center px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
                        >
                            <div>
                                <span className="font-semibold text-slate-800 text-sm">{p.name}</span>
                                <span className="text-xs text-slate-400 ml-1.5">@{p.userid}</span>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                                ${p.gender === "M"
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-pink-100 text-pink-600"
                                }`}>
                                {p.gender === "M" ? "남" : "여"}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => readyPlayers(userid)}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition active:scale-[0.98]
                        ${isAlreadyReady
                            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                        }`}
                >
                    {isAlreadyReady ? "✕ Ready 취소" : "✓ Ready"}
                </button>

                <button
                    type="button"
                    disabled={!isAlreadyReady}
                    onClick={() => ready ? matchPlayers(ready, courtCount) : null}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition active:scale-[0.98]
                        ${isAlreadyReady
                            ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-200"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                >
                    매칭 시작
                </button>
            </div>

            {/* 대기열 */}
            <div className="page-card">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-700">대기열</h3>
                    <span className="text-xs font-semibold bg-violet-100 text-violet-600 px-2.5 py-1 rounded-full">
                        {ready ? ready.length : 0}명
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {ready?.length === 0 && (
                        <p className="text-xs text-slate-400">Ready한 플레이어가 없습니다</p>
                    )}
                    {ready?.map((p) => (
                        <span key={p.userid}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full
                                ${p.gender === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                            {p.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* 매칭 결과 */}
            {courts && (
                <div className="page-card space-y-4">
                    <h2 className="text-sm font-bold text-slate-700">매칭 결과</h2>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {courts.map((court, idx) => (
                            <div key={idx} className="border-2 border-violet-100 rounded-xl p-3 bg-violet-50/50">
                                <p className="text-xs font-bold text-violet-500 mb-2 uppercase tracking-wide">
                                    코트 {idx + 1}
                                </p>
                                <ul className="space-y-1.5">
                                    {court.map((p) => (
                                        <li key={p.userid} className="flex items-center gap-1.5">
                                            <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center
                                                ${p.gender === "M" ? "bg-blue-200 text-blue-700" : "bg-pink-200 text-pink-700"}`}>
                                                {p.gender === "M" ? "M" : "F"}
                                            </span>
                                            <span className="text-sm font-medium text-slate-700">{p.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-slate-500">쉬는 사람</p>
                            <span className="text-xs text-slate-400">{resting?.length}명</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {resting?.map((p) => (
                                <span key={p.userid}
                                    className="text-xs font-medium bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                                    {p.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
