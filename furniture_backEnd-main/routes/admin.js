const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const {
  createAdmin,
  loginAdmin,
  getProductAdmin,
  getUserAdmin,
  getOrderAdmin,
  getOrderAdminDetail,
  updateOrderAdmin
} = require("../controllers/admin");

router.route("/").post(createAdmin);
router.route("/product").get(requireAuth, getProductAdmin);
router.route("/user").get(requireAuth, getUserAdmin);
router.route("/order").get(requireAuth, getOrderAdmin);
router.route('/order/:id').get(requireAuth, getOrderAdminDetail).patch(requireAuth, updateOrderAdmin)
router.route("/login").post(loginAdmin);
module.exports = router;
