import { useQuery } from "@tanstack/react-query";
import { Fragment, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { authContext } from "../../context/AuthContext";
import { GetOrderReviewItemsService } from "../../services/ReviewService";
import { cartImageUrl, formatVariantTitle } from "../../utils";
import "./OrderReviewPage.scss";

const OrderReviewHubPage = () => {
  const { orderId } = useParams();
  const { token } = useContext(authContext);

  const { data: res, isLoading } = useQuery({
    queryKey: ["order-review-items", orderId, token],
    queryFn: () => GetOrderReviewItemsService(orderId, token),
    enabled: Boolean(token && orderId),
  });

  const hub = res?.data;
  const items = hub?.items || [];

  if (!token) {
    return (
      <section className="section section-center page">
        <p>
          Please <Link to="/login">log in</Link> to rate your order.
        </p>
      </section>
    );
  }

  return (
    <section className="order-review-hub section section-center page">
      <div className="order-review-page__breadcrumb">
        <Link to="/">Home</Link> / <Link to="/user/order">Orders</Link> / Rate
        order
      </div>

      <h2 style={{ marginBottom: 8 }}>Rate your purchase</h2>
      <p style={{ color: "#666", marginBottom: 24 }}>
        {hub?.canReview
          ? "Choose a product below to leave a star rating and comment."
          : `Order status: ${hub?.status || "unknown"}. You can rate products after the order is delivered.`}
      </p>

      {isLoading && <p>Loading...</p>}

      {!isLoading && !res?.success && (
        <div className="order-review-page__card">
          <p>{res?.message || "Order not found."}</p>
          {res?.statusCode === 404 && (
            <p style={{ color: "#888", fontSize: 14, marginTop: 8 }}>
              Try logging in again, or confirm the backend is running locally on port 8080.
            </p>
          )}
          <Link to="/user/order" className="btn" style={{ marginTop: 12 }}>
            My orders
          </Link>
        </div>
      )}

      {!isLoading && res?.success && (
        <div className="order-review-page__card">
          {items.length === 0 && <p>No items in this order.</p>}
          {items.map((it) => (
            <div className="order-review-hub__item" key={it.itemIndex}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img
                  src={cartImageUrl({ url: it.imageUrl })}
                  alt={it.productName || ""}
                />
                <div>
                  <strong>{it.productName}</strong>
                  {it.variantTitle ? (
                    <div style={{ color: "#888", fontSize: 13 }}>
                      {formatVariantTitle(it.variantTitle)}
                    </div>
                  ) : null}
                  {it.hasReview ? (
                    <div style={{ color: "#ab7a5f", fontSize: 13 }}>
                      {"★".repeat(it.rating || 0)} — Reviewed
                    </div>
                  ) : null}
                </div>
              </div>
              {hub?.canReview ? (
                <Link
                  to={`/order/${orderId}/review/${it.itemIndex}`}
                  className="btn"
                  style={{ padding: "8px 14px", whiteSpace: "nowrap" }}
                >
                  {it.hasReview ? "Edit review" : "Rate"}
                </Link>
              ) : (
                <span style={{ color: "#999", fontSize: 13 }}>Not delivered yet</span>
              )}
            </div>
          ))}
          <Link
            to="/user/order"
            className="btn"
            style={{
              marginTop: 20,
              background: "transparent",
              border: "1px solid var(--clr-primary-5)",
              color: "var(--clr-primary-5)",
              boxShadow: "none",
            }}
          >
            Back to orders
          </Link>
        </div>
      )}
    </section>
  );
};

export default OrderReviewHubPage;
