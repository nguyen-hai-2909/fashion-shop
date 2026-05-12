/* eslint-disable react/prop-types */
import  { useContext } from "react";
import logoImg from "../../assets/images/logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { BsFillPersonPlusFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { authContext } from "../../context/AuthContext";
import { cartContext } from "../../context/CartContext";
import { renderTotalAmountCartProducts } from "../../utils";

const Sidebar = (props) => {
  const { token } = useContext(authContext);
  const { products } = useContext(cartContext);
  const navigate = useNavigate();
  const { isShowSidebar, handleToggleShowSidebar } = props;
  return (
    <div>
      <aside
        className={`${isShowSidebar ? "sidebar is-show-sidebar" : "sidebar"}`}
      >
        <div className="sidebar-header">
          <img src={logoImg} alt="" />
          <button className="close-btn" onClick={handleToggleShowSidebar}>
            <AiOutlineClose />
          </button>
        </div>
        <ul className="nav-links">
          <li onClick={handleToggleShowSidebar}>
            <Link to="/">home</Link>
          </li>
          <li onClick={handleToggleShowSidebar}>
            <Link to="/about">about</Link>
          </li>
          <li onClick={handleToggleShowSidebar}>
            <Link to="/products">products</Link>
          </li>
        </ul>
        <div className="cart-btn-wrap">
          <Link
            to="/cart"
            className="cart-btn"
            onClick={handleToggleShowSidebar}
          >
            cart
            <span className="cart-container">
              <FaShoppingCart />
              <span className="cart-values">
                {renderTotalAmountCartProducts(products)}
              </span>
            </span>
          </Link>
          {!token ? (
            <button
              className="login-btn"
              type="button"
              onClick={() => {
                navigate("/login", { replace: true });
                handleToggleShowSidebar()
              }}
            >
              login
              <BsFillPersonPlusFill className="icon-login" />
            </button>
          ) : (
            <Link
              to={`/user/me`}
              className="login-btn"
              onClick={handleToggleShowSidebar}
            >
              User
              <FaUser className="icon-login" />
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
