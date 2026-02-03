"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const server_1 = __importDefault(require("./server"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const http_1 = __importDefault(require("http"));
const websocket_1 = require("./websocket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use("/api", server_1.default);
// app.use((req, res, next) => {
//   console.log("Incoming request:", req.method, req.url);
//   next();
// });
(0, websocket_1.initSocket)(server);
const PORT = 4000;
if (!process.env.MONGO_URI) {
    console.error("몽고db uri 없음");
    process.exit(1); // 아예 서버 실행 중단
}
mongoose_1.default.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));
// app.listen(PORT,"0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
server.listen(4000, "0.0.0.0", () => {
    console.log("Server listening on 4000");
});
