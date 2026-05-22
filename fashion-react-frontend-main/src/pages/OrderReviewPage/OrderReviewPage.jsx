import { useMutation, useQuery } from "@tanstack/react-query";
import { Fragment, useCallback, useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authContext } from "../../context/AuthContext";
import {
  GetOrderReviewItemService,
  SubmitOrderReviewService,
} from "../../services/ReviewService";
import { cartImageUrl } from "../../utils";
import { showToast } from "../../utils/showToast";
import "./OrderReviewPage.scss";

const OrderReviewPage = () => {
  const { orderId, itemIndex } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(authContext);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: reviewRes, isLoading, refetch } = useQuery({
    queryKey: ["order-review-item", orderId, itemIndex, token],
    queryFn: () => GetOrderReviewItemService(orderId, itemIndex, token),
    enabled: Boolean(token && orderId && itemIndex != null),
    onSuccess: (res) => {
      if (res?.success && res?.data) {
        setRating(res.data.rating > 0 ? res.data.rating : 5);
        setComment(res.data.comment || "");
      }
    },
  });

  const item = reviewRes?.data;
  const canReview = item?.canReview !== false;

  const mutateReview = useMutation({
    mutationFn: (payload) =>
      SubmitOrderReviewService(orderId, itemIndex, payload, token),
  });

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!canReview) return;
      const res = await mutateReview.mutateAsync({ rating, comment });
      if (!res?.success) {
        showToast.error(res?.message || "Review failed");
        return;
      }
      showToast.success("Review submitted");
      refetch();
      navigate(`/order/${orderId}/review`, { replace: true });
    },
    [canReview, comment, itemIndex, mutateReview, navigate, orderId, rating, refetch]
  );

  if (!token) {
    return (
      <section className="section section-center page">
        <p>Please <Link to="/login">log in</Link> to review your purchase.</p>
      </section>
    );
  }

  return (
    <section className="order-review-page section section-center page">
      <div className="order-review-page__breadcrumb">
        <Link to="/">Home</Link> / <Link to="/user/order">Orders</Link> /{" "}
        <Link to={`/order/${orderId}/review`}>Rate order</Link> / Review
      </div>

      {isLoading && <p>Loading...</p>}

      {!isLoading && !reviewRes?.success && (
        <div className="order-review-page__card">
          <p>{reviewRes?.message || "This item cannot be reviewed."}</p>
          <Link to="/user/order" className="btn" style={{ marginTop: 12 }}>
            Back to orders
          </Link>
        </div>
      )}

      {!isLoading && reviewRes?.success && (
        <div className="order-review-page__card">
          <div className="order-review-page__product">
            <img
              src={cartImageUrl({ url: item?.imageUrl })}
              alt={item?.productName || ""}
            />
            <div>
              <h2>{item?.productName}</h2>
              {item?.variantTitle ? (
                <p style={{ color: "#888", margin: 0 }}>{item.variantTitle}</p>
              ) : null}
              <p style={{ color: "#888", margin: "8px 0 0" }}>
                Order #{item?.orderNumber || orderId}
              </p>
            </div>
          </div>

          {!canReview ? (
            <Fragment>
              <p className="order-review-page__hint">
                Reviews open when your order is confirmed or delivered.
              </p>
              <Link to={`/user/order/${orderId}`} className="btn">
                View order
              </Link>
            </Fragment>
          ) : (
            <form onSubmit={handleSubmit}>
              <fieldset className="order-review-page__stars">
                {[5, 4, 3, 2, 1].map((star) => (
                  <Fragment key={star}>
                    <input
                      type="radio"
                      id={`star-${star}`}
                      name="rating"
                      value={star}
                      checked={rating === star}
                      onChange={() => setRating(star)}
                    />
                    <label htmlFor={`star-${star}`} title={`${star} stars`}>
                      ★
                    </label>
                  </Fragment>
                ))}
              </fieldset>
              <textarea
                className="order-review-page__comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
              />
              <button
                type="submit"
                className="btn"
                style={{ width: "100%", marginTop: 16 }}
                disabled={mutateReview.isLoading}
              >
                {mutateReview.isLoading
                  ? "Submitting..."
                  : item?.hasReview
                    ? "Update review"
                    : "Submit review"}
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
};

export default OrderReviewPage;
