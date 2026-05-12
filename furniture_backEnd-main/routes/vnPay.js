const express = require('express');
const router = express.Router();

const {getCreateVNPay, postCreateVNPay, getVNPayReturn, getVNPayIpn} = require('../controllers/vnPay')

router.route('/create_payment_url').get(getCreateVNPay).post(postCreateVNPay);
router.route('/vnpay_return').get(getVNPayReturn);
router.route('/vnpay_ipn').get(getVNPayIpn)

module.exports = router;