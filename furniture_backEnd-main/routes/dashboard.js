const express = require("express");
const router = express.Router();

const { getDashboard } = require("../controllers/dashboard");
const { requireAuth } = require("../middleware/authMiddleware");

router.route("/").get(requireAuth, getDashboard);

module.exports = router;
