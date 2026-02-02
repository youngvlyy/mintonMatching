"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const models_1 = require("./models");
const redis_1 = __importDefault(require("./redis"));
const initSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ["polling", "websocket"],
    });
    io.on("connection", (socket) => {
        console.log("소켓 연결됨:", socket.id);
        //방 생성
        socket.on("makeRoom", async () => {
            io.emit("roomupdate");
        });
        //방 들어갈때
        socket.on("joinRoom", async (roomid, userid) => {
            socket.join(roomid);
            socket.data.roomid = roomid;
            socket.data.userid = userid;
            const readykey = `room:${roomid}:ready`;
            const isreadykey = `room:${roomid}:isready`;
            const roomkey = `room:${roomid}`;
            const matchingkey = `room:${roomid}:matching`;
            const pendingKey = `pending:${roomid}:${userid}`;
            const isPending = await redis_1.default.exists(pendingKey);
            // 재접속시 삭제 취소
            if (isPending) {
                await redis_1.default.del(pendingKey);
            }
            const user = await models_1.User.findOne({ userid });
            if (!user)
                return;
            const value = JSON.stringify({
                userid: user.userid,
                name: user.name,
                gender: user.gender,
            });
            // player redis 저장 (userid를 key로 사용)
            const exists = await redis_1.default.hExists(roomkey, userid);
            if (!exists) {
                await redis_1.default.hSet(roomkey, userid, value);
            }
            const PlayersRaw = await redis_1.default.hGetAll(roomkey);
            const Players = Object.values(PlayersRaw).map((v) => JSON.parse(v));
            // 현재 ready 플레이어 전체
            const readyPlayersRaw = await redis_1.default.hGetAll(readykey);
            const readyPlayers = readyPlayersRaw ? Object.values(readyPlayersRaw).map((v) => JSON.parse(v)) : null;
            //매칭 결과
            const matchingRaw = await redis_1.default.get(matchingkey);
            const matching = matchingRaw ? JSON.parse(matchingRaw) : null;
            //ready 버튼 상태
            const isrexists = await redis_1.default.hExists(isreadykey, userid);
            if (!isrexists) {
                await redis_1.default.hSet(isreadykey, userid, "0");
            }
            const isready = await redis_1.default.hGet(isreadykey, userid);
            socket.emit("matchingPlayers", matching);
            socket.emit("readyPlayers", readyPlayers);
            socket.emit("isready", isready);
            // socket.emit("inupdatePlayers", Players);
            io.to(roomid).emit("inupdatePlayers", Players); //다른사람에게 입장 알림
        });
        //방 나갈때
        socket.on("leaveRoom", async (roomid, userid) => {
            socket.leave(roomid);
            const roomkey = `room:${roomid}`;
            const readykey = `room:${roomid}:ready`;
            const isreadykey = `room:${roomid}:isready`;
            const exists = await redis_1.default.hExists(roomkey, userid);
            if (exists) {
                //player 삭제
                await redis_1.default.hDel(roomkey, userid);
            }
            // 현재 플레이어 전체
            const PlayersRaw = await redis_1.default.hGetAll(roomkey);
            const Players = Object.values(PlayersRaw).map((v) => JSON.parse(v));
            //readyplayer 체크
            const rexists = await redis_1.default.hExists(readykey, userid);
            if (rexists) {
                //readyplayer 삭제
                await redis_1.default.hDel(readykey, userid);
            }
            //readyPlayer 전체
            const readyPlayersRaw = await redis_1.default.hGetAll(readykey);
            const readyPlayers = Object.values(readyPlayersRaw).map((v) => JSON.parse(v));
            //ready 버튼 상태
            await redis_1.default.hDel(isreadykey, userid);
            //player 전원 나감
            if (Object.keys(PlayersRaw).length === 0) {
                await models_1.Room.findByIdAndDelete(roomid);
                await redis_1.default.del(roomkey);
                console.log("방 삭제됨:", roomid);
                io.emit("roomupdate");
            }
            else {
                io.to(roomid).emit("readyPlayers", readyPlayers);
                io.to(roomid).emit("outupdatePlayer", Players);
            }
        });
        //연결 끊겼을때
        socket.on("disconnect", async () => {
            const { roomid, userid } = socket.data || {};
            if (!roomid || !userid)
                return;
            const pendingKey = `pending:${roomid}:${userid}`;
            // 30분 유예(모바일 화면전환)
            await redis_1.default.set(pendingKey, "1", {
                EX: 1800, //초단위
            });
            //30분 뒤에도 재접속 안했는지 검사
            setTimeout(async () => {
                const roomkey = `room:${roomid}`;
                const readykey = `room:${roomid}:ready`;
                const isreadykey = `room:${roomid}:isready`;
                // 현재 플레이어 전체
                const PlayersRaw = await redis_1.default.hGetAll(roomkey);
                const Players = Object.values(PlayersRaw).map((v) => JSON.parse(v));
                //readyplayer 체크
                const rexists = await redis_1.default.hExists(readykey, userid);
                //readyPlayer 전체
                const readyPlayersRaw = await redis_1.default.hGetAll(readykey);
                const readyPlayers = Object.values(readyPlayersRaw).map((v) => JSON.parse(v));
                //ready 버튼 상태
                // const isready =  await redis.hGet(isreadykey, userid);
                //재접속 하면 false
                const stillPending = await redis_1.default.exists(pendingKey);
                if (stillPending) {
                    // 30분 동안 재접속 안 함
                    await redis_1.default.hDel(roomkey, userid); // 플레이어 삭제
                    await redis_1.default.hDel(isreadykey, userid); // isready 삭제
                    await redis_1.default.del(pendingKey);
                    if (rexists) {
                        //readyplayer 삭제
                        await redis_1.default.hDel(readykey, userid);
                    }
                    if (Object.keys(PlayersRaw).length === 0) {
                        await models_1.Room.findByIdAndDelete(roomid);
                        await redis_1.default.del(roomkey);
                        console.log("방 삭제됨:", roomid);
                    }
                    else {
                        io.to(roomid).emit("readyPlayers", readyPlayers);
                        io.to(roomid).emit("outupdatePlayer", Players);
                    }
                }
            }, 1800000);
        });
        //ready 상태
        socket.on("ready", async (roomid, userid) => {
            const key = `room:${roomid}:ready`;
            const isreadykey = `room:${roomid}:isready`;
            socket.join(roomid);
            // 유저 정보 가져옴
            const user = await models_1.User.findOne({ userid });
            if (!user)
                return;
            const value = JSON.stringify({
                userid: user.userid,
                name: user.name,
                gender: user.gender,
            });
            //redis 저장 userid를 key로 사용
            await redis_1.default.hSet(key, userid, value);
            // 현재 ready 플레이어 전체
            const readyPlayersRaw = await redis_1.default.hGetAll(key);
            const readyPlayers = Object.values(readyPlayersRaw).map((v) => JSON.parse(v));
            //ready 버튼 상태
            await redis_1.default.hSet(isreadykey, userid, "1");
            const isready = await redis_1.default.hGet(isreadykey, userid);
            io.to(roomid).emit("readyPlayers", readyPlayers);
            socket.emit("isready", isready);
        });
        socket.on("notready", async (roomid, userid) => {
            socket.join(roomid);
            const key = `room:${roomid}:ready`;
            const isreadykey = `room:${roomid}:isready`;
            const exists = await redis_1.default.hExists(key, userid);
            if (!exists)
                return;
            await redis_1.default.hDel(key, userid);
            const readyPlayersRaw = await redis_1.default.hGetAll(key);
            const readyPlayers = Object.values(readyPlayersRaw).map((v) => JSON.parse(v));
            //ready 버튼 상태
            await redis_1.default.hSet(isreadykey, userid, "0");
            const isready = await redis_1.default.hGet(isreadykey, userid);
            io.to(roomid).emit("readyPlayers", readyPlayers);
            socket.emit("isready", isready);
        });
        socket.on("emptyready", async (roomid) => {
            socket.join(roomid);
            const isreadykey = `room:${roomid}:isready`;
            const key = `room:${roomid}:ready`;
            const all = await redis_1.default.hGetAll(isreadykey);
            if (Object.keys(all).length) {
                const init = Object.keys(all).flatMap(u => [u, "0"]);
                await redis_1.default.hSet(isreadykey, init);
            }
            const readyPlayers = null;
            const f = false;
        });
        socket.on("matching", async (roomid, courts, resting, matchingcount) => {
            const key = `room:${roomid}:ready`;
            const matchingkey = `room:${roomid}:matching`;
            const value = JSON.stringify({
                courts, resting, matchingcount
            });
            const readyPlayersRaw = await redis_1.default.hGetAll(key);
            const readyPlayers = Object.keys(readyPlayersRaw);
            // matching redis 저장
            await redis_1.default.set(matchingkey, value);
            const matchingRaw = await redis_1.default.get(matchingkey);
            const matching = matchingRaw ? JSON.parse(matchingRaw) : null;
            await redis_1.default.del(key);
            //모든 방 사람에게 매칭 알림
            io.to(roomid).emit("matchingPlayers", matching);
            io.to(roomid).emit("initreadyPlayers", { readyPlayers: [], f: false });
            //모든 연결된 소켓들
            const socketsInRoom = await io.in(roomid).fetchSockets();
            // ready한 사람에게만 알림
            for (const s of socketsInRoom) {
                if (readyPlayers.includes(s.data.userid)) {
                    s.emit("matchingAlert", "매칭 완료");
                }
            }
        });
    });
};
exports.initSocket = initSocket;
