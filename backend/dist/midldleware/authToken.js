"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authToken = void 0;
// middleware/auth.js
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "토큰 없음" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY); //객체(JwtPayload) / string
        if (typeof decoded === "string" ||
            !("userid" in decoded)) {
            return res.status(401).json({ error: "잘못된 토큰" });
        }
        req.user = decoded.userid;
        console.log("req.user", req.user);
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "유효하지 않은 토큰" });
    }
};
exports.authToken = authToken;
