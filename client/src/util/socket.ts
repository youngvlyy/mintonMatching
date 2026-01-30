import { io } from "socket.io-client";

export const socket = io("http://192.168.219.46:4000", {
  autoConnect: true,
  withCredentials: true,
  transports: ["websocket","polling"],
});
