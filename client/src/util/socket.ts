import { io } from "socket.io-client";

export const socket = io("http://192.168.0.26:4000", {
  autoConnect: true,
  withCredentials: true,
  transports: ["websocket","polling"],
});
