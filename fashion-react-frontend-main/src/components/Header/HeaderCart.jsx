import { FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import logoUrl from "../../assets/images/logo.svg";
import { useContext } from "react";
import { cartContext } from "../../context/CartContext";
import { renderTotalAmountCartProducts } from "../../utils";
const HeaderCart = () => {
  const { products } = useContext(cartContext);
  //! Props

  //! State

  //! Function

  //! Effect

  //! Render
  return (
    <div style={{ padding: "1rem 0", borderBottom: "1px solid #dedede" }}>
      <section className="section-center checkout-title">
        <nav>
          <div className="checkout-nav">
            <div className="checkout-header">
              <Link to={"/"}>
                <img src={logoUrl} alt="" />
              </Link>
            </div>
            <div className="checkout-cart">
              <Link to="/cart">
                <span className="checkout-cart_container">
                  <FaShoppingCart style={{ width: "24px", height: "24px" }} />
                  <span className="checkout-cart_container-value">
                    {renderTotalAmountCartProducts(products)}
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </nav>
      </section>
    </div>
  );
};

export default HeaderCart;
