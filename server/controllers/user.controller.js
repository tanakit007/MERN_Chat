const UserModel = require("../models/user.models.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signUp = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        message: "Email is already used",
      });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await UserModel.create({
      fullName,
      email,
      password: hashedPassword,
    });

    return res.status(201).send({
      message: "User registered successfully",
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message || "Error while registering user",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        message: "Email or Password are missing",
      });
    }

    const userDoc = await UserModel.findOne({ email });
    if (!userDoc) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, userDoc.password);

    if (!isPasswordMatched) {
      return res.status(401).send({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: userDoc._id, email: userDoc.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // ✅ เพิ่มการส่ง Cookie ตรงนี้
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 1 วัน
    });

    return res.status(200).send({
      message: "Login successful",
      token,
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message || "Error while logging in",
    });
  }
};

const userController = {
  signUp,
  login,
};
module.exports = userController;
