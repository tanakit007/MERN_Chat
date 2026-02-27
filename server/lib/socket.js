require("dotenv").config();
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: [process.env.CLIENT_URL],
  },
});

const userSocketMap = {}; // ใช้ {} เพื่อความถูกต้องในการ Map key-value

function getRecipientSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  const userId = socket.handshake.query.userId;

  // ตรวจสอบว่ามี userId และต้องไม่เป็น String คำว่า "undefined"
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log("User Socket Map:", userSocketMap);
  }

  // ส่งรายชื่อคนออนไลน์ (เฉพาะคนที่มี ID จริงๆ)
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.emit("request");
  io.emit("broadcast");

  socket.on("reply", () => {
    /* … logic ของคุณ … */
  });

  // แก้ไข: ย้าย disconnect ออกมาไว้ที่ระดับ connection (แก้ปีกกาที่ซ้อนผิด)
  socket.on("disconnect", () => {
    console.log("A user disconnected: " + socket.id);
    if (userId && userId !== "undefined") {
      delete userSocketMap[userId];
    }
    console.log("UserSocketMap Updated:", userSocketMap);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = { app, io, server, getRecipientSocketId };
