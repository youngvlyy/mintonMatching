"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redis = (0, redis_1.createClient)({
    url: "redis://localhost:6379",
});
redis.on("error", (err) => console.error("Redis Error", err));
function initRedis() {
    try {
        redis.connect();
    }
    catch (error) {
        console.error(error.message);
    }
    console.log("Redis connected");
}
initRedis();
exports.default = redis;
