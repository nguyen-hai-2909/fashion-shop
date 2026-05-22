/* eslint-disable react/prop-types */
import { Fragment, useEffect, useState } from "react";
import qrPaymentImg from "../../../assets/images/qr-payment.png";
import "./PaymentSection.scss";

const PaymentSection = ({ helperFormik }) => {
  const paymentMethod = helperFormik?.values?.paymentMethod ?? "COD";
  const [showTransferQr, setShowTransferQr] = useState(paymentMethod === "TRANSFER");

  useEffect(() => {
    setShowTransferQr(paymentMethod === "TRANSFER");
  }, [paymentMethod]);

  return (
    <Fragment>
      <div className="d-flex-column payment-section">
        <h4>Payment method</h4>
        <p className="payment-section__hint">
          Select COD or bank transfer, then confirm.
        </p>
        <div className="checkout-content-input payment-section__select-wrap">
          <label className="payment-section__label" htmlFor="paymentMethod">
            Payment method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            className="payment-section__select"
            value={paymentMethod}
            onChange={(e) => {
              helperFormik.setFieldValue("paymentMethod", e.target.value);
            }}
            required
          >
            <option value="COD">Cash on delivery (COD)</option>
            <option value="TRANSFER">Bank transfer</option>
          </select>
          <div
            id="transfer-qr-box"
            className={`transfer-qr-box${showTransferQr ? " transfer-qr-box--visible" : ""}`}
          >
            <p>
              After your transfer is complete, please contact us to verify the
              transaction.
            </p>
            <img src={qrPaymentImg} alt="Bank transfer QR code" />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default PaymentSection;
