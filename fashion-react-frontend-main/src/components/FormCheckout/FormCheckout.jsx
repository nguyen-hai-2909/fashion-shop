/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import { Form, Formik } from "formik";
import ContactSection from "./ContactSection/ContactSection";
import DeliverySection from "./DeliverySection/DeliverySection";
import PaymentSection from "./PaymentSection/PaymentSection";
import { useCallback } from "react";
import * as Yup from "yup";

const FormCheckout = (props) => {
  //! Props
  const { helperFormik } = props;
  //! State

  //! Function
  //! Effect

  //! Render
  return (
    <div className="checkout-content-form">
      <ContactSection helperFormik={helperFormik} />
      <DeliverySection helperFormik={helperFormik} />
      <PaymentSection helperFormik={helperFormik} />
    </div>
  );
};

export default FormCheckout;
