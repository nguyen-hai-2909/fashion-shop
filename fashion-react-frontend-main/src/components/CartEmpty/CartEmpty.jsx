import { Link } from "react-router-dom";

const CartEmpty = () => {
  return (
    <section className="wrap-empty">
      <div className="empty-cart">
        <h2>your cart is empty</h2>
        <Link to="/products" className="btn">
          fill it
        </Link>
      </div>
    </section>
  );
};

export default CartEmpty;
