import { io } from "socket.io-client";

export const socket = io("http://192.168.200.169:4000", {
  autoConnect: true,
  withCredentials: true,
  transports: ["websocket","polling"],
});
