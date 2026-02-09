const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

//http://localhost:5000/api/v1/users/signup
router.post("/signup", userController.signUp);

//http://localhost:5000/api/v1/users/login
router.post("/login", userController.login);

//http://localhost:5000/api/v1/users/logout
router.post("/logout", userController.logout);

module.exports = router;
