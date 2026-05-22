/* eslint-disable react/prop-types */
import { ErrorMessage, FastField } from "formik";
import { Fragment } from "react";

const ContactSection = (props) => {
  //! Props
  const { helperFormik } = props;
  //! State

  //! Function

  //! Effect

  //! Render

  return (
    <Fragment>
      <div className="d-flex-column">
        <h4>Contact</h4>
        <div className="checkout-content-input">
          <FastField
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            className={helperFormik.errors.email && "border-err"}
          />
          <span id="errTextEmail" className="err-text">
            <ErrorMessage name="email" />
          </span>
        </div>
      </div>
    </Fragment>
  );
};

export default ContactSection;
