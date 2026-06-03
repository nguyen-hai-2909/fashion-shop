/* eslint-disable react/prop-types */
import { useCallback, useContext } from "react";
import { FastField, Formik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { cartContext } from "../../context/CartContext";
import { discountContext } from "../../context/DiscountContext";
import { CheckDiscountService } from "../../services/DiscountService";
import {
  cartImageUrl,
  colorLabelFromValue,
  formatCurrency,
  handleRenderSubtotalCart,
  handleRenderTotalDiscount,
  renderShippingFee,
} from "../../utils";
import HashLoader from "react-spinners/HashLoader";
import { Flex } from "antd";

const ProductCheckout = (props) => {
  const { products: cartProducts } = useContext(cartContext);
  const {
    discountCode: discountCodeCtx,
    value: valueDiscountCtx,
    dispatch: dispatchDiscount,
  } = useContext(discountContext);
  //! Props
  const { isLoading, products: productsProp, discountCode: discountCodeProp, valueDiscount: valueDiscountProp } = props;
  const products = productsProp ?? cartProducts;

  const discountCode = discountCodeProp !== undefined ? discountCodeProp : discountCodeCtx;
  const valueDiscount = valueDiscountProp !== undefined ? valueDiscountProp : valueDiscountCtx;

  const mutateDiscount = useMutation({
    mutationFn: (discount) => CheckDiscountService(discount),
  });

  const handleSubmitDiscount = useCallback(
    async (values) => {
      try {
        const response = await mutateDiscount.mutateAsync({
          discountCode: values.discountCode,
        });
        const { success, message } = response;
        if (!success) {
          throw new Error(message);
        }
        toast.success(message);
        dispatchDiscount({
          type: "ADD_DISCOUNT",
          payload: {
            discountCode: response?.discount.idDiscount,
            value: response?.discount.valueDiscount,
          },
        });
      } catch (error) {
        toast.error(error.message);
      }
    },
    [dispatchDiscount, mutateDiscount]
  );
  //! State

  //! Function

  //! Effect

  //! Render
  return (
    <div className="checkout-content-product">
      <div
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {(products || []).map((el) => {
          return (
            <div className="checkout-content-product_item" key={el?.id}>
              <div className="checkout-content-product_item-img">
                <img src={cartImageUrl(el?.image)} alt="" />
              </div>
              <div className="checkout-content-product_item-info">
                <span className="title">{el?.name}</span>
                <span>color: {colorLabelFromValue(el?.color)}</span>
                <span>amount: {el?.amount}</span>
                <span>price: {formatCurrency(el?.price)}</span>
              </div>
              <div className="checkout-content-product_item-price">
                <span>{formatCurrency(el?.amount * el?.price)}</span>
              </div>
            </div>
          );
        })}
        <hr />
        <div className="checkout-content-product-total">
          <div className="checkout-content-product-total_item">
            <span>Subtotal</span>
            <span>{formatCurrency(handleRenderSubtotalCart(products))}</span>
          </div>
          <Formik
            initialValues={{ discountCode: discountCode ?? "" }}
            enableReinitialize
            onSubmit={handleSubmitDiscount}
          >
            {({ handleSubmit }) => (
              <div className="form-discount checkout-discount">
                <FastField
                  name="discountCode"
                  className="checkout-discount__input"
                  placeholder="Enter discount code..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-checkout-discount"
                  onClick={() => handleSubmit()}
                >
                  Apply code
                </button>
              </div>
            )}
          </Formik>
          <div className="checkout-content-product-total_item">
            <span style={{ fontWeight: "400" }}>Discount code</span>
            <span style={{ fontWeight: "400" }}>{discountCode ?? ""}</span>
          </div>
          <div className="checkout-content-product-total_item">
            <span style={{ fontWeight: "400" }}>Discount</span>
            <span style={{ fontWeight: "400" }}>
              - {formatCurrency(
                handleRenderTotalDiscount(discountCode, valueDiscount, products)
              )}
            </span>
          </div>
          <div className="checkout-content-product-total_item">
            <span style={{ fontWeight: "400" }}>Shipping fee</span>
            <span style={{ fontWeight: "400" }}>
              {formatCurrency(renderShippingFee(products))}
            </span>
          </div>
          <div className="checkout-content-product-total_item">
            <span style={{ fontSize: "24px" }}>Order total</span>
            <span style={{ fontSize: "24px" }}>
              {formatCurrency(
                handleRenderSubtotalCart(products) +
                  renderShippingFee(products) -
                  handleRenderTotalDiscount(
                    discountCode,
                    valueDiscount,
                    products
                  )
              )}
            </span>
          </div>
          <button
            className="btn"
            style={{ padding: "14px", borderRadius: "4px", marginTop: "12px" }}
            type="submit"
          >
            {isLoading ? <Flex justify="center"><HashLoader size={28} color="#f1f5f8" /></Flex> : "Pay now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCheckout;
