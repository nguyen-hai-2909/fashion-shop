import { Fragment } from "react";
import codImg from "../../../assets/images/COD.svg";
const PaymentSection = () => {
  //! Props

  //! State

  //! Function

  //! Effect

  //! Render
  return (
    <Fragment>
      <div className="d-flex-column">
        <h4>Payment</h4>
        <div className="checkout-content-input">
          <div className="tag-payment">
            <img src={codImg} alt="" />
            <p>COD</p>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default PaymentSection;
