/* eslint-disable react/prop-types */
import { ErrorMessage, FastField } from "formik";
import { Fragment } from "react";

const DeliverySection = (props) => {
  //! Props
  const { helperFormik } = props;
  //! State

  //! Function

  //! Effect

  //! Render
  return (
    <Fragment>
      <div className="d-flex-column">
        <h4>Delivery</h4>
        <div className="delivery-form-wrap">
          <div className="checkout-content-input">
            <FastField
              name="name"
              type="text"
              id="name"
              placeholder="Full name"
              className={helperFormik.errors.name && "border-err"}
            />
            <span id="errTextName" className="err-text">
              <ErrorMessage name="name" />
            </span>
          </div>
          <div className="checkout-content-input">
            <FastField
              name="phoneNumber"
              type="text"
              id="phoneNumber"
              placeholder="Phone number"
              className={helperFormik.errors.phoneNumber && "border-err"}
            />
            <span id="errTextPhoneNumber" className="err-text">
              <ErrorMessage name="phoneNumber" />
            </span>
          </div>
          <div className="checkout-content-input">
            <FastField
              name="address"
              type="text"
              id="address"
              placeholder="Address"
              className={helperFormik.errors.address && "border-err"}
            />
            <span id="errTextAddress" className="err-text">
              <ErrorMessage name="address" />
            </span>
          </div>
          <div className="checkout-content-input">
            <FastField
              name="note"
              type="text"
              id="Note"
              placeholder="Note"
              className={helperFormik.errors.note && "border-err"}
            />
            <span id="errTextNote" className="err-text">
              <ErrorMessage name="note" />
            </span>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default DeliverySection;
