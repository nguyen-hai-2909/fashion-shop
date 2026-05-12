import "./CheckoutSuccess.scss";
import successIcon from "../../assets/images/verify.png";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
const CheckoutSuccess = () => {
  const navigate = useNavigate();
  //! Props

  //! State

  //! Function

  //! Effect

  //! Render
  return (
    <div className="wrap-checkout-success">
      <div className="wrap-checkout-success_content">
        <div className="wrap-checkout-success_content-img">
          <img src={successIcon} alt="" />
        </div>
        <div className="wrap-checkout-success_content-text">
          <h4>Order successful🎉🎉🎉!</h4>
          <span style={{ color: "#d9d9d9" }}>
            Thank you so much for your order.
          </span>
        </div>
        <div className="wrap-checkout-success_content-btn">
          <Button
            onClick={() => {
              navigate("/user/order", { replace: true });
            }}
          >
            VIEW ORDER
          </Button>
          <button
            className="btn"
            style={{ padding: "8px 16px" }}
            onClick={() => {
              navigate("/products", { replace: true });
            }}
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
