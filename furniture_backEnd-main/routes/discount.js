const express = require("express");
const router = express.Router();

const {
  getAllDiscount,
  getDiscountId,
  createDiscount,
  createDiscountEmail,
  getDiscountWithCode,
  checkDiscountCode,
  updateDiscount,
  deleteMultiDiscount,
} = require("../controllers/discount");
const { requireAuth } = require("../middleware/authMiddleware");

router
  .route("/")
  .get(requireAuth, getAllDiscount)
  .post(requireAuth, createDiscount);
router
  .route("/:id")
  .get(requireAuth, getDiscountId)
  .patch(requireAuth, updateDiscount);
router.route("/code/:discountCode").get(getDiscountWithCode);
router.route("/code").post(checkDiscountCode);
router.route("/email").post(createDiscountEmail);
router.route("/multi").delete(requireAuth, deleteMultiDiscount);
module.exports = router;
