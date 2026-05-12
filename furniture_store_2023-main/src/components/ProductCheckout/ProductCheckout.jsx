/* eslint-disable react/prop-types */
import { useContext } from "react";
import { cartContext } from "../../context/CartContext";
import { discountContext } from "../../context/DiscountContext";
import {
  cartImageUrl,
  displayColorLabel,
  formatCurrency,
  handleRenderSubtotalCart,
  handleRenderTotalDiscount,
  renderShippingFee,
} from "../../utils";
import { colorsList } from "../../constants";
import HashLoader from "react-spinners/HashLoader";
import { Flex } from "antd";

const ProductCheckout = (props) => {
  const { products } = useContext(cartContext);
  const { discountCode, value: valueDiscount } = useContext(discountContext);
  //! Props
  const { isLoading } = props;
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
                <span>
                  color:{" "}
                  {colorsList.find((c) => c.value === el?.color)?.label ??
                    displayColorLabel(el?.color)}
                </span>
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
