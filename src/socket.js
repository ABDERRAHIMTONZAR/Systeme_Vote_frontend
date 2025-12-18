import { io } from "socket.io-client";

export const socket = io("http://localhost:3001", {
  transports: ["websocket"],
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("✅ Socket connecté:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("❌ Socket error:", err.message);
});
