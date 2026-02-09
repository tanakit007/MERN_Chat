const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;
const UserRouter = require("./routers/user.router");

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
  }),
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello! You welcome to the MERN Chat Server 🚀");
});

app.use("/api/v1/users", UserRouter);

if (!DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is not defined in .env file");
} else {
  mongoose
    .connect(DATABASE_URL)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));
}

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
