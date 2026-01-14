import { Server } from "socket.io";
import { User } from "./models";
import redis from "./redis";

export const initSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });


  io.on("connection", (socket) => {
    console.log("소켓 연결됨:", socket.id);

    //방 들어갈때
    socket.on("joinRoom", async (roomid, userid) => {
      socket.join(roomid);
      socket.data.roomid = roomid;
      socket.data.userid = userid;
      const readykey = `room:${roomid}:ready`;
      const roomkey = `room:${roomid}`;
      const pendingKey = `pending:${roomid}:${userid}`;
      const isPending = await redis.exists(pendingKey);


      // 재접속시 삭제 취소
      if(isPending) await redis.del(pendingKey);

      const user = await User.findOne({ userid });
      if (!user) return;

      const value = JSON.stringify({
        userid: user.userid,
        name: user.name,
        gender: user.gender,
      });

      // player redis 저장 (userid를 key로 사용)
      await redis.hSet(roomkey, userid, value);
      const PlayersRaw = await redis.hGetAll(roomkey);
      const Players = Object.values(PlayersRaw).map((v) =>
        JSON.parse(v)
      );

      // 현재 ready 플레이어 전체
      const readyPlayersRaw = await redis.hGetAll(readykey);
      const readyPlayers = Object.values(readyPlayersRaw).map((v) =>
        JSON.parse(v)
      );

      io.to(roomid).emit("readyPlayers", readyPlayers);
      io.to(roomid).emit("inupdatePlayers", Players);
    });

    //방 나갈때
    socket.on("leaveRoom", async (roomid, userid) => {
      socket.leave(roomid);
      const roomkey = `room:${roomid}`;
      const readykey = `room:${roomid}:ready`;

      //재접속시
      const exists = await redis.hExists(roomkey, userid);
      if (exists) {
        //player 삭제
        await redis.hDel(roomkey, userid);
      }

      // 현재 플레이어 전체
      const PlayersRaw = await redis.hGetAll(roomkey);

      const Players = Object.values(PlayersRaw).map((v) =>
        JSON.parse(v)
      );


      //readyplayer 체크
      const rexists = await redis.hExists(readykey, userid);

      if (rexists) {
        //readyplayer 삭제
        await redis.hDel(readykey, userid);
      }

      //readyPlayer 전체
      const readyPlayersRaw = await redis.hGetAll(readykey);
      const readyPlayers = Object.values(readyPlayersRaw).map((v) =>
        JSON.parse(v)
      );


      io.to(roomid).emit("readyPlayers", readyPlayers);
      io.to(roomid).emit("outupdatePlayer", Players);
    });

    //연결 끊겼을때
    socket.on("disconnect", async () => {
      const { roomid, userid } = socket.data || {};
      if (!roomid || !userid) return;

      const pendingKey = `pending:${roomid}:${userid}`;

      // 5분 유예(모바일 화면전환)
      await redis.set(pendingKey, "1", {
        EX: 300,
      });

      //5분 뒤에도 재접속 안했는지 검사
      setTimeout(async () => {
        //재접속 하면 false
        const stillPending = await redis.exists(`pending:${roomid}:${userid}`);

        if (stillPending) {
          // 30초 동안 재접속 안 함
          await redis.hDel(`room:${roomid}`, userid);
          io.to(roomid).emit("outupdatePlayer");
        }
      }, 300000);


    });

    //ready 상태
    socket.on("ready", async (roomid, userid) => {
      const key = `room:${roomid}:ready`;
      socket.join(roomid);

      // 유저 정보 가져옴
      const user = await User.findOne({ userid });
      if (!user) return;

      const value = JSON.stringify({
        userid: user.userid,
        name: user.name,
        gender: user.gender,
      });

      //redis 저장 userid를 key로 사용
      await redis.hSet(key, userid, value);

      // 현재 ready 플레이어 전체
      const readyPlayersRaw = await redis.hGetAll(key);

      const readyPlayers = Object.values(readyPlayersRaw).map((v) =>
        JSON.parse(v)
      );

      io.to(roomid).emit("readyPlayers", readyPlayers);
    });


    socket.on("notready", async (roomid, userid) => {
      socket.join(roomid);

      const key = `room:${roomid}:ready`;

      const exists = await redis.hExists(key, userid);
      if (!exists) return;

      await redis.hDel(key, userid);

      const readyPlayersRaw = await redis.hGetAll(key);
      const readyPlayers = Object.values(readyPlayersRaw).map((v) =>
        JSON.parse(v)
      );

      io.to(roomid).emit("readyPlayers", readyPlayers);
    });

    socket.on("emptyready", async (roomid) => {
      socket.join(roomid);

      const key = `room:${roomid}:ready`;

      await redis.del(key);

      const readyPlayers = null;
      const f:boolean = false;

      io.to(roomid).emit("initreadyPlayers", {readyPlayers,f});
    });



    socket.on("matching", async (roomid, courts, resting) => {
      const key = `room:${roomid}:ready`;
      const readyPlayersRaw = await redis.hGetAll(key);
      const readyPlayers = Object.keys(readyPlayersRaw);

      //모든 방 사람에게 매칭 알림
      io.to(roomid).emit("matchingPlayers", { courts, resting });

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
