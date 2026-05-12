import { Fragment, useCallback, useContext } from "react";
import "./CheckoutPage.scss";
import HeaderCart from "../../components/Header/HeaderCart";
import FormCheckout from "../../components/FormCheckout/FormCheckout";
import ProductCheckout from "../../components/ProductCheckout/ProductCheckout";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { cartContext } from "../../context/CartContext";
import { discountContext } from "../../context/DiscountContext";
import { useMutation } from "@tanstack/react-query";
import { CheckoutOrderService } from "../../services/OrderService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { authContext } from "../../context/AuthContext";
import { renderShippingFee } from "../../utils";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { token } = useContext(authContext);
  const { products, dispatch } = useContext(cartContext);
  const {
    discountCode,
    value: valueDiscount,
    dispatch: dispatchDiscount,
  } = useContext(discountContext);
  //! Props

  //! State
  const mutateCheckout = useMutation({
    mutationFn: (data) => CheckoutOrderService(data, token),
  });
  //! Function
  const handleSubmit = useCallback(async (values) => {
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("name", values.name);
    formData.append("phoneNumber", values.phoneNumber);
    formData.append("address", values.address);
    formData.append("note", values.note);
    formData.append("paymentMethod", values.paymentMethod);
    formData.append("discountCode", discountCode ? discountCode : "");
    formData.append("valueDiscount", valueDiscount);
    formData.append("products", JSON.stringify(products));
    formData.append("shippingFee", renderShippingFee(products));
    try {
      const response = await mutateCheckout.mutateAsync(formData);
      const { success, message } = response;
      if (!success) {
        throw new Error(message);
      }
      dispatch({ type: "CLEAR_CART" });
      dispatchDiscount({ type: "CLEAR_DISCOUNT" });
      navigate(`/checkout/success/${response.order._id}`);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }, []);
  //! Effect

  //! Render
  return (
    <Fragment>
      <HeaderCart />
      <section className="section-center checkout-content">
        <Formik
          initialValues={{
            name: "",
            email: "",
            phoneNumber: "",
            address: "",
            note: "",
            paymentMethod: "COD",
          }}
          validationSchema={Yup.object({
            name: Yup.string().required("Required!").trim(),
            phoneNumber: Yup.string()
              .required("Require!")
              .max(10, "Invalid phone number!")
              .min(10, "Invalid phone number!")
              .trim(),
            email: Yup.string()
              .required("Require!")
              .email("Invalid email!")
              .trim(),
            address: Yup.string().required("Required!").trim(),
          })}
          enableReinitialize
          validateOnBlur={false}
          validateOnChange={false}
          validateOnMount={false}
          onSubmit={handleSubmit}
        >
          {(helperFormik) => {
            return (
              <Form>
                <FormCheckout helperFormik={helperFormik} />
                <ProductCheckout isLoading={mutateCheckout.isLoading} />
              </Form>
            );
          }}
        </Formik>
      </section>
    </Fragment>
  );
};

export default CheckoutPage;
