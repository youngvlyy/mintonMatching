import { createClient } from "redis";

const redis = createClient({
  url: "redis://localhost:6379",
});

redis.on("error", (err) => console.error("Redis Error", err));

function initRedis() {
    try {
        redis.connect();
    } catch (error) {
        console.error((error as any).message);
    }
  console.log("Redis connected");
}

initRedis();
export default redis;
