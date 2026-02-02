"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("./models");
const models_2 = require("./models");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = express_1.default.Router();
// 사용자 정보 등록
router.post("/signup", async (req, res) => {
    const { name, userid, password, gender } = req.body;
    if (!name || !userid || !password || !gender)
        return res.status(400).json({ message: "필수 값 누락" });
    try {
        let user = await models_1.User.findOne({ userid });
        if (user)
            return res.status(409).json({ message: "이미 존재하는 계정입니다" });
        const hashedPw = await bcrypt_1.default.hash(password, 10); //비밀번호 암호화(10번 해시)
        const newUser = new models_1.User({
            name,
            userid,
            password: hashedPw,
            gender,
            room: "none"
        });
        await newUser.save();
        return res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 오류" });
    }
});
//로그인
router.post("/login", async (req, res) => {
    const { userid, password } = req.body;
    const user = await models_1.User.findOne({ userid });
    if (!user)
        return res.status(400).json({ message: "존재하지 않는 아이디입니다." });
    const isMatch = await bcrypt_1.default.compare(password, user.password); //원본 비번과 해시비번 비교
    if (!isMatch)
        return res.status(400).json({ message: "비밀번호가 올바르지 않습니다." });
    const token = jsonwebtoken_1.default.sign({ userid: user.userid }, `${process.env.SECRET_KEY}`, {
        expiresIn: "3h",
    });
    res.json({ success: true, token });
});
//방 만들기
router.post("/room", async (req, res) => {
    const { title } = req.body;
    try {
        const room = await models_2.Room.create({
            title
        });
        res.json(room);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "서버 오류" });
    }
});
//방 정보 얻기(id, title, favorite)
router.get("/room", async (req, res) => {
    try {
        const rooms = await models_2.Room.find();
        res.json(rooms);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "서버 오류" });
    }
});
//개인 정보 얻기
router.get("/user/:userid", async (req, res) => {
    const { userid } = req.params;
    try {
        const user = await models_1.User.findOne({ userid });
        res.json(user);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "서버 오류" });
    }
});
//개인정보 수정
router.patch("/user/:userid", async (req, res) => {
    const { userid } = req.params;
    const { name, gender } = req.body;
    try {
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (gender !== undefined)
            updateData.gender = gender;
        const patchuser = await models_1.User.findOneAndUpdate({ userid }, updateData, { new: true } //새로운 문서
        );
        res.json(patchuser);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "서버 오류" });
    }
});
//개인정보 삭제
router.delete("/user/:userid", async (req, res) => {
    const { userid } = req.params;
    try {
        await models_1.User.deleteOne({ userid });
        res.json({ success: true, message: "탈퇴되었습니다 ㅠ" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "서버 오류" });
    }
});
//비밀번호 변경
router.patch("/userpasswardauth/:userid", async (req, res) => {
    const { userid } = req.params;
    const { password } = req.body;
    try {
        if (!password) {
            return res.status(400).json({
                success: false,
                error: "변경하실 비밀번호를 입력해주세요",
            });
        }
        const hashedPw = await bcrypt_1.default.hash(password, 10); //비밀번호 암호화(10번 해시)
        await models_1.User.findOneAndUpdate({ userid }, { password: hashedPw }, { new: true } //새로운 문서
        );
        res.json({ success: true, message: "변경이 완료되었습니다" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "서버 오류" });
    }
});
//비밀번호 인증
router.post("/userpasswardauth/:userid", async (req, res) => {
    const { userid } = req.params;
    const { password } = req.body;
    try {
        const user = await models_1.User.findOne({ userid });
        if (!user) {
            return res.json({ success: false });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (isMatch) {
            res.json({ success: true });
        }
        else {
            res.json({ success: false, error: "비밀번호가 틀렸습니다" });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "서버 오류" });
    }
});
//아이디 중복 확인
router.get("/:userid", async (req, res) => {
    const { userid } = req.params;
    if (!userid)
        return res.status(400).json({ error: "필수 값 누락" });
    try {
        const user = await models_1.User.findOne({ userid });
        if (user) {
            return res.json({ success: false, message: "이미 사용 중인 아이디입니다." });
        }
        else {
            return res.json({ success: true, message: "사용 가능한 아이디입니다." });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "서버 오류" });
    }
});
exports.default = router;
