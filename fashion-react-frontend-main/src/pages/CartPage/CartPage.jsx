import { Fragment, useCallback, useContext } from "react";
import CartEmpty from "../../components/CartEmpty/CartEmpty";
import { Link, useNavigate } from "react-router-dom";
import { FastField, Form, Formik } from "formik";
import "./Cart.scss";
import { cartContext } from "../../context/CartContext";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { MdOutlineRemoveShoppingCart } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { CheckDiscountService } from "../../services/DiscountService";
import { toast } from "react-toastify";
import { discountContext } from "../../context/DiscountContext";
import { authContext } from "../../context/AuthContext";
import {
  cartImageUrl,
  formatCurrency,
  handleRenderSubtotalCart,
  handleRenderTotalDiscount,
  renderShippingFee,
} from "../../utils";
const CartPage = () => {
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
  const mutateDiscount = useMutation({
    mutationFn: (discount) => CheckDiscountService(discount),
  });
  //! Function
  const handleClearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);
  const handleSubmitDiscount = useCallback(async (values) => {
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
      console.log(error);
      toast.error(error.message);
    }
  }, []);
  const handleRemoveBtn = useCallback((id) => {
    dispatch({ type: "REMOVE_PRODUCT_IN_CART", payload: { id: id } });
  }, []);
  const handleChangeAmount = useCallback((id, type) => {
    dispatch({ type: "CHANGE_AMOUNT", payload: { id: id, type: type } });
  }, []);

  //! Effect

  //! Render
  if (products?.length === 0) return <CartEmpty />;
  return (
    <Fragment>
      <section className="title-section">
        <div className="section-center">
          <h3>
            <a href="/">Home</a> / cart
          </h3>
        </div>
      </section>
      <section className="cart-center section section-center page">
        <div className="title-cart">
          <div className="content-title">
            <h5>item</h5>
            <h5>price</h5>
            <h5>quantity</h5>
            <h5>subtotal</h5>
            <span style={{ width: "2rem" }}></span>
          </div>
          <hr />
        </div>
        <div className="carts-content">
          {(products || []).map((cart) => {
            const { id, amount, color, image, maxAmount, name, price } = cart;
            return (
              <article key={`${id}`} className="cart-item">
                <div className="img-title">
                  <img src={cartImageUrl(image)} alt={name} />
                  <div>
                    <h5 className="name-cart">{name}</h5>
                    <p className="color-cart">
                      color:{" "}
                      <span
                        style={{
                          backgroundColor: `${color}`,
                          border: "1px solid #dedede",
                        }}
                      />
                    </p>
                    <h5 className="price-small">{formatCurrency(price)}</h5>
                  </div>
                </div>
                <h5 className="price-cart">{formatCurrency(price)}</h5>
                <div className="amounts-btn">
                  {amount === 1 ? (
                    <button
                      disabled
                      style={{ cursor: "no-drop" }}
                      type="button"
                      className="dec-btn"
                    >
                      <AiOutlineMinus />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="dec-btn"
                      onClick={() => handleChangeAmount(id, "dec")}
                    >
                      <AiOutlineMinus />
                    </button>
                  )}
                  <h3>{amount <= maxAmount ? amount : maxAmount}</h3>
                  {amount >= maxAmount ? (
                    <button
                      disabled
                      type="button"
                      style={{ cursor: "no-drop" }}
                      className="inc-btn"
                    >
                      <AiOutlinePlus />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="inc-btn"
                      onClick={() => handleChangeAmount(id, "inc")}
                    >
                      <AiOutlinePlus />
                    </button>
                  )}
                </div>
                <h5 className="subtotal">
                  {formatCurrency(
                    price * (amount <= maxAmount ? amount : maxAmount)
                  )}
                </h5>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveBtn(id)}
                >
                  <MdOutlineRemoveShoppingCart />
                </button>
              </article>
            );
          })}
        </div>
        <hr />
        <div className="links-container">
          <Link className="link-btn" to="/products">
            continue shopping
          </Link>
          <button
            type="button"
            className="link-btn clear-btn"
            onClick={handleClearCart}
          >
            clear shopping cart
          </button>
        </div>
        <section className="total-price">
          <div>
            <article>
              <h5>
                subtotal :{" "}
                <span style={{ textAlign: "end" }}>
                  {formatCurrency(handleRenderSubtotalCart(products))}
                </span>
              </h5>
              <p style={{ marginBottom: "8px" }}>
                discount :
                <span style={{ textAlign: "end" }}>
                  -{" "}
                  {formatCurrency(
                    handleRenderTotalDiscount(
                      discountCode,
                      valueDiscount,
                      products
                    )
                  )}
                </span>
              </p>
              <p>
                shipping fee :
                <span style={{ textAlign: "end" }}>
                  {formatCurrency(renderShippingFee(products))}
                </span>
              </p>
              <hr />
              <h4>
                order total :{" "}
                <span style={{ textAlign: "end" }}>
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
              </h4>
            </article>
            <Formik
              initialValues={{
                discountCode: discountCode ? discountCode : "",
              }}
              onSubmit={handleSubmitDiscount}
            >
              {() => {
                return (
                  <Form className="form-discount">
                    <FastField
                      // component={InputCustom}
                      name="discountCode"
                      placeholder="Discount code ..."
                      // variant="outlined"
                      // sx={{ marginTop: ".25rem", width: "100%" }}
                    />
                  </Form>
                );
              }}
            </Formik>
            {token ? (
              <button
                type="button"
                className="btn btn-checkout"
                style={{ paddingTop: "12px", paddingBottom: "12px" }}
                onClick={() => {
                  navigate("/checkout", { replace: true });
                }}
              >
                checkout
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-checkout"
                onClick={() => {
                  navigate("/login", { replace: true });
                }}
              >
                login
              </button>
            )}
          </div>
        </section>
      </section>
    </Fragment>
  );
};

export default CartPage;
