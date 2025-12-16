import { io } from "socket.io-client";

export const socket = io("http://localhost:3001", {
  transports: ["websocket"],
  autoConnect: true,
});

socket.on("connect", () => console.log("✅ socket connected:", socket.id));
socket.on("connect_error", (err) => console.log("❌ socket connect_error:", err.message));
socket.onAny((event, ...args) => console.log("📩 socket event:", event, args));
