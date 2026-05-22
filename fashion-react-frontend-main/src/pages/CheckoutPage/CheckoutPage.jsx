import { Fragment, useCallback, useContext, useMemo } from "react";
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
import { useLocation, useNavigate } from "react-router-dom";
import { showToast } from "../../utils/showToast";
import { getOrderIdFromCheckoutResponse } from "../../utils/authToken";
import { authContext } from "../../context/AuthContext";
import { renderShippingFee } from "../../utils";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useContext(authContext);
  const { products, dispatch } = useContext(cartContext);
  const buyNow = location.state?.buyNow === true;
  const checkoutProducts = useMemo(() => {
    if (buyNow && Array.isArray(location.state?.products) && location.state.products.length > 0) {
      return location.state.products;
    }
    return products;
  }, [buyNow, location.state?.products, products]);
  const {
    discountCode: discountCodeCtx,
    value: valueDiscountCtx,
    dispatch: dispatchDiscount,
  } = useContext(discountContext);

  // Buy Now skips any discount previously applied to the cart
  const discountCode = buyNow ? null : discountCodeCtx;
  const valueDiscount = buyNow ? 0 : valueDiscountCtx;
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
    formData.append("products", JSON.stringify(checkoutProducts));
    formData.append("shippingFee", renderShippingFee(checkoutProducts));
    try {
      const response = await mutateCheckout.mutateAsync(formData);
      const { success, message } = response;
      if (!success) {
        throw new Error(message);
      }
      if (buyNow) {
        checkoutProducts.forEach((item) => {
          dispatch({ type: "REMOVE_PRODUCT_IN_CART", payload: { id: item.id } });
        });
      } else {
        dispatch({ type: "CLEAR_CART" });
      }
      dispatchDiscount({ type: "CLEAR_DISCOUNT" });
      const orderId = getOrderIdFromCheckoutResponse(response);
      if (!orderId) {
        showToast.error("Order created but id missing — check My Orders");
        navigate("/user/order", { replace: true });
        return;
      }
      navigate(`/checkout/success/${orderId}`, { replace: true });
    } catch (error) {
      console.log(error);
      showToast.error(error.message);
    }
  }, [
    buyNow,
    checkoutProducts,
    discountCode,
    dispatch,
    dispatchDiscount,
    mutateCheckout,
    navigate,
    token,
    valueDiscount,
  ]);
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
                <ProductCheckout
                  isLoading={mutateCheckout.isLoading}
                  products={checkoutProducts}
                  discountCode={discountCode}
                  valueDiscount={valueDiscount}
                />
              </Form>
            );
          }}
        </Formik>
      </section>
    </Fragment>
  );
};

export default CheckoutPage;
