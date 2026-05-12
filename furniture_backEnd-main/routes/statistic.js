const express = require("express");
const router = express.Router();

const { getStatistic } = require("../controllers/statistic");
const { requireAuth } = require("../middleware/authMiddleware");

router.route("/").get(requireAuth, getStatistic);

module.exports = router;
