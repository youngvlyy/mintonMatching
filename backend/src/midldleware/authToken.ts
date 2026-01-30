// middleware/auth.js
import jwt from "jsonwebtoken";

export const authToken = (req: any, res: any, next: any) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "토큰 없음" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.SECRET_KEY as string); //객체(JwtPayload) / string

        if (
            typeof decoded === "string" ||
            !("userid" in decoded)
        ) {
            return res.status(401).json({ error: "잘못된 토큰" });
        }
        req.user = decoded.userid;

        console.log("req.user",req.user);
        next();
    } catch (err) {
        return res.status(401).json({ error: "유효하지 않은 토큰" });
    }
};
