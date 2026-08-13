const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const middleware = require("../middleware")
router.post("/signup", authController.signup)
router.post("/login", authController.login)

//for check the token
router.get(
  "/session",
  middleware.stripToken,
  middleware.verifyToken,
  authController.checkSession
)

module.exports = router
