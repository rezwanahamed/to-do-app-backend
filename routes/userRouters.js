const express = require("express");
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all todo routes
router.use(protect);

router.route("/profile").get(userController.fetchUserData);
router.route("/update").put(userController.updatedUser);

module.exports = router;
