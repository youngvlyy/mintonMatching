import express from "express";
import jwt from "jsonwebtoken";
import { User } from "./models";
import { Room } from "./models";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const router = express.Router();


// 사용자 정보 등록
router.post("/signup", async (req, res) => {
    const { name, userid, password, gender } = req.body;

    if (!name || !userid || !password || !gender)
        return res.status(400).json({ message: "필수 값 누락" });

    try {
        let user = await User.findOne({ userid });
        if (user)
            return res.status(409).json({ message: "이미 존재하는 계정입니다" });

        const hashedPw = await bcrypt.hash(password, 10); //비밀번호 암호화(10번 해시)

        const newUser = new User({
            name,
            userid,
            password: hashedPw,
            gender,
            room: "none"
        });

        await newUser.save();

        return res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 오류" });
    }
});



//로그인
router.post("/login", async (req, res) => {
    const { userid, password } = req.body;

    const user = await User.findOne({ userid });
    if (!user)
        return res.status(400).json({ message: "존재하지 않는 아이디입니다." });

    const isMatch = await bcrypt.compare(password, user.password); //원본 비번과 해시비번 비교
    if (!isMatch)
        return res.status(400).json({ message: "비밀번호가 올바르지 않습니다." });

    const token = jwt.sign({ userid: user.userid }, `${process.env.SECRET_KEY}`, {
        expiresIn: "3h",
    });

    res.json({ success: true, token });
});

//방 만들기
router.post("/room", async (req, res) => {
    const { title } = req.body;

    try {
        const room = await Room.create({
            title
        });
        res.json(room);


    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ success: false, error: "서버 오류" });
    }

});

//방 삭제
router.delete("/remove/:roomid", async (req, res) => {
    const { roomid } = req.params;

    try {
        //user 정보 탐색
        await Room.findByIdAndDelete(roomid);
        return res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "서버 오류" });
    }
});


//방 정보 얻기(id, title, favorite)
router.get("/room", async (req, res) => {

    try {
        const rooms = await Room.find();
        res.json(rooms);


    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ success: false, error: "서버 오류" });
    }

});

//개인 정보 얻기
router.get("/user/:userid", async (req, res) => {
    const { userid } = req.params;

    try {
        const user = await User.findOne({ userid });
        res.json(user);


    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ success: false, error: "서버 오류" });
    }

});

//아이디 중복 확인
router.get("/:userid", async (req, res) => {
    const { userid } = req.params;

    if (!userid) return res.status(400).json({ error: "필수 값 누락" });

    try {
        const user = await User.findOne({ userid });

        if (user) {
            return res.json({ success: false, message: "이미 사용 중인 아이디입니다." });
        } else {
            return res.json({ success: true, message: "사용 가능한 아이디입니다." });
        }
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ success: false, error: "서버 오류" });
    }
});

//게임방 참여회원 추가
// router.patch("/inpatchplayer/:roomid/:userid", async (req, res) => {
//     const { roomid, userid } = req.params;

//     try {
//         const user = await User.findOne({ userid });
//         // const room = await Room.findById(roomid);

//         if (!user) {
//             return res.status(400).json({ error: "Room not found" });
//         }

//         await Room.findByIdAndUpdate(
//             roomid,
//             { 
//               $addToSet: { players: userid }   // DB 자체에서 atomic 중복 체크
//             },
//             { new: true }
//         );

//         // 중복 플레이어 체크
//         // const exists = room.players.some(player => player.userid === userid);

//         // if (!exists) {
//         //     room.players.push({
//         //         name: user?.name,
//         //         userid: user?.userid,
//         //         gender: user?.gender
//         //     });
//         //     await room.save();
//         // }

//         return res.json(room.players);

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "서버 오류" });
//     }
// });

//게임방 플레이어 정보 얻기
// router.get("/playerinfo/:roomid/:userid", async (req, res) => {
//   const { roomid, userid } = req.params;

//   try {
//     const room = await Room.findById(roomid);

//     if (!room) {
//       return res.status(404).json({ error: "룸 없음" });
//     }

//     const player = room.players.find(p => p.userid === userid);

//     if (!player) {
//       return res.status(404).json({ error: "플레이어 없음" });
//     }

//     return res.json(player);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "서버 오류" });
//   }
// });


//게임방 참여회원 삭제
// router.patch("/outpatchplayer/:roomid/:userid", async (req, res) => {
//     const { roomid, userid } = req.params;

//     try {
//         //user 정보 탐색
//         const updatedRoom = await Room.findByIdAndUpdate(
//             roomid,
//             { $pull: { players: { userid } } }, 
//             { new: true }                       // 수정된 후 문서를 반환
//         );

//         return res.json(updatedRoom?.players);

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "서버 오류" });
//     }
// });






export default router;
