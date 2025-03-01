const express = require("express");
const googleAuthController = require("../controllers/googleAuthController");

const router = express.Router();

// Auth routes
router.get("/google", googleAuthController.googleAuth);
router.get("/redirect", googleAuthController.googleAuthRedirect);

module.exports = router;
