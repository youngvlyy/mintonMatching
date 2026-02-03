import { io } from "socket.io-client";

export const socket = io("https://mintonminchin.shop", {
  path: "/api/socket.io",
  autoConnect: true,
  withCredentials: true,
  transports: ["websocket","polling"],
});
