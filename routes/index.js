"use strict";

const express = require("express");
const router = express.Router();

const auth = require("./authRoutes");
const user = require("./userRouters");
const todo = require("./todoRoutes");
const googleAuth = require("./googleAuthRoutes");

// Routers
router.use("/auth", auth);
router.use("/user", user);
router.use("/todo", todo);
router.use("/google_auth", googleAuth);

module.exports = router;
