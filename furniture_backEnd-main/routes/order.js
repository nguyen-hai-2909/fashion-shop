const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const {
  getAllOrder,
  createOrder,
  getOrderDetail,
} = require("../controllers/order");
const multer = require("multer");
const upload = multer();

router
  .route("/")
  .get(requireAuth, getAllOrder)
  .post(upload.none(), requireAuth, createOrder);
router.route("/:id").get(requireAuth, getOrderDetail);

module.exports = router;
