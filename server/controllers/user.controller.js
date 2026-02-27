// import library สำหรับเข้ารหัสรหัสผ่าน
const bcrypt = require("bcrypt");
// import library สำหรับสร้าง JWT token
const jwt = require("jsonwebtoken");
// import Model ของ User จาก mongoose
const UserModel = require("../models/User");
// โหลดตัวแปรจากไฟล์ .env
require("dotenv").config();
// ดึง secret key สำหรับใช้ sign JWT
const secret = process.env.JWT_SECRET;
const cloudinary = require("../configs/cloudinary");

/**
 * =========================
 * REGISTER (สมัครสมาชิก)
 * =========================
 */
const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      message: "Please provide fullname, email and password",
    });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "This email is already existed",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = await UserModel.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id, fullName: user.fullName }, secret, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "User Register in successfully",
      _id: user._id, // แก้จาก id เป็น _id ให้ตรงกับที่ frontend เรียกใช้
      fullName: user.fullName,
      accessToken: token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Some errors occurred while registering user",
    });
  }
};

/**
 * =========================
 * LOGIN (เข้าสู่ระบบ)
 * =========================
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide email and password",
    });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatched = bcrypt.compareSync(password, user.password);

    if (!isPasswordMatched) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, fullName: user.fullName }, secret, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
      accessToken: token, // ส่ง Token กลับไปให้ Frontend เก็บใน LocalStorage/Cookie
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Some errors occurred while logging in user",
    });
  }
};

/**
 * =========================
 * GET USERS FOR SIDEBAR (ดึงรายชื่อผู้ใช้คนอื่น)
 * =========================
 */
const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // ค้นหาผู้ใช้ทั้งหมดที่ไม่ใช่ตัวเอง และไม่ดึง password ออกมา
    const filteredUsers = await UserModel.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * =========================
 * UPDATE PROFILE (อัปเดตโปรไฟล์)
 * =========================
 */
const updateProfile = async (req, res) => {
  try {
    const { fullName, profilePic } = req.body;
    const userId = req.user._id;

    let updateData = {};

    if (fullName) updateData.fullName = fullName;

    if (profilePic) {
      // อัปโหลดรูปไปที่ Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    // อัปเดตข้อมูลและคืนค่าข้อมูลใหม่ (new: true)
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ส่งก้อนข้อมูล User ที่อัปเดตแล้วกลับไปให้ Frontend ทันที
    return res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      message: "Internal Server Error while updating profile",
    });
  }
};

const logOut = async (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Some errors occurred while logging out user",
    });
  }
};

const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error while checking auth" });
  }
};

module.exports = {
  register,
  login,
  logOut,
  updateProfile,
  checkAuth,
  getUsersForSidebar,
};
