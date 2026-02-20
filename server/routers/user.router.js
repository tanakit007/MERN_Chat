const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { protectedRoute } = require("../middlewares/auth.middleware");

//http://localhost:5000/users/register
router.post("/register", userController.register);
//http://localhost:5000/users/login
router.post("/login", userController.login);
//http://localhost:5000/users/logout
router.post("/logout", userController.logOut);
//http://localhost:5000/users/update-profile
router.put("/update-profile", protectedRoute, userController.updateProfile);
//http://localhost:5000/users/check-auth
router.get("/check-auth", protectedRoute, userController.checkAuth);
module.exports = router;
