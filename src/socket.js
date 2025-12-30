import { io } from "socket.io-client";

console.log("SOCKET_URL =", process.env.REACT_APP_SOCKET_URL);

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:3001";

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  withCredentials: true, // utile si tu utilises cookies
});

socket.on("connect", () => {
  console.log("✅ Socket connecté:", socket.id, "->", SOCKET_URL);
});

socket.on("connect_error", (err) => {
  console.log("❌ Socket error:", err.message, "->", SOCKET_URL);
});
socket.onAny((event, ...args) => {
  console.log("📩 [socket] event reçu:", event, args);
});
