const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

require("dotenv").config();

// Middleware สำหรับตรวจสอบ JWT token และดึงข้อมูล userจาก token มาเก็บไว้ใน req.user
const protectedRoute = async (req, res, next) => {
  try {
    // ดึง token จาก Authorization header หรือ cookie
    let token = req.cookies.token;
    console.log("🔍 Cookies:", req.cookies);
    console.log("🔍 Headers:", req.headers);

    // ถ้า cookie ไม่มี ลองดึงจาก Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      console.log("🔍 Auth Header:", authHeader);
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7); // ตัดคำว่า "Bearer " ออก
      }
    }

    console.log("🔍 Token:", token);

    // ถ้าไม่มี token ให้ส่ง response 401 Unauthorized
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token Provider" });
    }

    // ถ้ามี token ให้ verify token ด้วย secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔍 Decoded:", decoded);
    // ถ้า token ไม่ถูกต้องหรือหมดอายุ ให้ส่ง response 401 Unauthorized
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    // ถ้า token ถูกต้อง ให้ดึงข้อมูล user จาก database โดยใช้ userId ที่ได้จาก token
    const user = await UserModel.findById(decoded.id).select("-password");
    console.log("🔍 User found:", user);
    //ถ้าไม่เจอ user ต้องขึ้นแจ้งเตือนว่าหา user ไม่เจอ
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("🔍 Error:", error.message);
    res.status(500).json({ message: "Internal Server Error while checking " });
  }
};

const authMiddleware = {
  protectedRoute,
};
module.exports = authMiddleware;
