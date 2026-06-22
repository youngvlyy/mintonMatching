import jwt from "jsonwebtoken";

export const authToken = (req: any, res: any, next: any) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ error: "토큰 없음" });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY as string);

        if (typeof decoded === "string" || !("userid" in decoded)) {
            return res.status(401).json({ error: "잘못된 토큰" });
        }

        req.user = decoded.userid;
        next();
    } catch {
        return res.status(401).json({ error: "유효하지 않은 토큰" });
    }
};
