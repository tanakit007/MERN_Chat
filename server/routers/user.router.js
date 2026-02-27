const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { protectedRoute } = require("../middlewares/auth.middleware");

//http://localhost:5000/user/register
router.post("/register", userController.register);
//http://localhost:5000/user/login
router.post("/login", userController.login);
//http://localhost:5000/user/logout
router.post("/logout", userController.logOut);
//http://localhost:5000/user/update-profile
router.put("/update-profile", protectedRoute, userController.updateProfile);
//http://localhost:5000/user/check-auth
router.get("/check-auth", protectedRoute, userController.checkAuth);

// เพิ่มบรรทัดนี้ในไฟล์
router.get("/sidebar", protectedRoute, userController.getUsersForSidebar);
module.exports = router;
