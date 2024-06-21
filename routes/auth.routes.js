const express = require("express")
const { login, logout, register, profile } = require("../controllers/authController.js")

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/profile", profile)

module.exports = router;

