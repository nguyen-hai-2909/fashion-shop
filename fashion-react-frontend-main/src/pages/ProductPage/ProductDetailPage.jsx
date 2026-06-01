import { useMutation, useQuery } from "@tanstack/react-query";
import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/Loader/Loading";
import { GetDetailProductService } from "../../services/ProductService";
import { BsCheck } from "react-icons/bs";
import { AiOutlineMinus, AiOutlinePlus, AiOutlineEdit } from "react-icons/ai";
import { Modal } from "antd";
import { cartContext } from "../../context/CartContext";
import { formatCurrency, productImageUrl } from "../../utils";
import { buildCartLineItem } from "../../utils/buildCartLineItem";
import { showToast } from "../../utils/showToast";
import { labelForBrand, labelForCategory } from "../../constants";
import { authContext } from "../../context/AuthContext";
import {
  GetProductReviewsService,
  GetReviewableService,
  SubmitReviewService,
} from "../../services/ReviewService";

/** Return true if the hex colour is light (luminance > 0.55). */
function isLightColor(hex) {
  if (!hex || !hex.startsWith("#")) return false;
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.55;
}

const ProductDetailPage = () => {
  const { identifier } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useContext(cartContext);
  const { token } = useContext(authContext);

  const [detailProduct, setDetailProduct] = useState(null);
  const [imgMain, setImgMain] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("M");
  const [amountProduct, setAmountProduct] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewable, setReviewable] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const resolvedProductId = detailProduct?._id || identifier;
  const productIdForReviews = detailProduct?._id;

  const variants = useMemo(() => {
    const raw = detailProduct?.stock || [];
    return raw.map((v) => ({
      ...v,
      color:
        typeof v?.color === "object" && v?.color != null
          ? v.color.name || v.color.label || ""
          : v?.color,
      hex:
        v?.hex ||
        (typeof v?.color === "object" && v?.color?.hex ? v.color.hex : v?.hex),
    }));
  }, [detailProduct?.stock]);
  const colorList = useMemo(
    () => [...new Set(variants.map((v) => v?.color).filter(Boolean))],
    [variants]
  );
  const sizesOfColor = useMemo(
    () =>
      [...new Set(variants.filter((v) => v?.color === selectedColor).map((v) => v?.size || "M"))],
    [variants, selectedColor]
  );
  const stockCurrent = useMemo(
    () =>
      variants.find(
        (v) => v?.color === selectedColor && (v?.size || "M") === (selectedSize || "M")
      ) || null,
    [variants, selectedColor, selectedSize]
  );
  const galleryItems = useMemo(() => {
    const variantItems = variants
      .map((v) => {
        const url = typeof v?.imageUrl === "string" ? v.imageUrl.trim() : "";
        if (!url) return null;
        return {
          variantId: v?._id,
          color: v?.color || "",
          size: v?.size || "M",
          url,
        };
      })
      .filter(Boolean);

    if (variantItems.length > 0) return variantItems;

    const coverImages = Array.isArray(detailProduct?.images) ? detailProduct.images : [];
    return coverImages.map((img) => ({
      variantId: null,
      color: "",
      size: "",
      url: typeof img?.url === "string" ? img.url : "",
    }));
  }, [variants, detailProduct?.images]);

  const { isLoading, isFetching, refetch } = useQuery(
    ["product-detail", identifier],
    () => GetDetailProductService(identifier),
    {
      enabled: false,
      onSuccess: (response) => {
        const p = response.product;
        setDetailProduct(p);
        const first = p?.stock?.[0] ?? null;
        setSelectedColor(first?.color || "");
        setSelectedSize(first?.size || "M");
        setImgMain(0);
        const canonicalPath = p?.slug ? `/products/${p.slug}` : null;
        if (canonicalPath && (identifier !== p.slug || location.search)) {
          navigate(canonicalPath, { replace: true });
        }
      },
    }
  );

  const { refetch: refetchReviews } = useQuery(
    ["product-reviews", productIdForReviews],
    () => GetProductReviewsService(productIdForReviews),
    {
      enabled: Boolean(productIdForReviews),
      onSuccess: (res) => {
        if (res?.success) {
          setReviews(res.data || []);
        } else {
          setReviews([]);
        }
      },
    }
  );

  const { refetch: refetchReviewable } = useQuery(
    ["reviewable", resolvedProductId, stockCurrent?._id],
    () => GetReviewableService({ productId: resolvedProductId, variantId: stockCurrent?._id }, token),
    {
      enabled: false,
      onSuccess: (res) => {
        setReviewable(res?.success ? res.data : null);
      },
    }
  );

  const mutateReview = useMutation({
    mutationFn: (payload) => SubmitReviewService(payload, token),
  });

  const handleClickAddCartItem = useCallback(() => {
    const line = buildCartLineItem(
      detailProduct,
      stockCurrent,
      amountProduct,
      resolvedProductId
    );
    if (!line) return;
    dispatch({
      type: "ADD_PRODUCT_TO_CART",
      payload: { product: line },
    });
    showToast.success("Product added");
  }, [detailProduct, stockCurrent, amountProduct, dispatch, resolvedProductId]);

  const handleBuyNow = useCallback(() => {
    const line = buildCartLineItem(
      detailProduct,
      stockCurrent,
      amountProduct,
      resolvedProductId
    );
    if (!line) return;
    if ((stockCurrent?.amount ?? 0) <= 0) return;
    navigate("/checkout", { state: { buyNow: true, products: [line] } });
  }, [detailProduct, stockCurrent, amountProduct, resolvedProductId, navigate]);

  const isOwnReview = useCallback(
    (rv) =>
      Boolean(
        reviewable &&
          stockCurrent?._id &&
          rv?.orderId === reviewable.orderId &&
          rv?.variantId === stockCurrent._id
      ),
    [reviewable, stockCurrent?._id]
  );

  const openReviewModal = useCallback(
    (rv) => {
      const r = rv?.rating > 0 ? rv.rating : reviewable?.rating > 0 ? reviewable.rating : 5;
      setRating(r);
      setComment(rv?.comment ?? reviewable?.comment ?? "");
      setReviewModalOpen(true);
    },
    [reviewable]
  );

  const handleSubmitReview = useCallback(async () => {
    if (!stockCurrent?._id || !reviewable) {
      return Promise.reject();
    }
    const payload = {
      orderId: reviewable.orderId,
      itemIndex: String(reviewable.itemIndex),
      rating,
      comment,
    };
    const res = await mutateReview.mutateAsync(payload);
    if (!res?.success) {
      showToast.error(res?.message || "Review failed");
      return Promise.reject();
    }
    showToast.success(res.message || "Review updated");
    setReviewModalOpen(false);
    refetchReviews();
    refetchReviewable();
  }, [
    stockCurrent?._id,
    rating,
    comment,
    reviewable,
    mutateReview,
    refetchReviewable,
    refetchReviews,
  ]);

  useEffect(() => {
    refetch();
  }, [identifier]);


  useEffect(() => {
    if (token && stockCurrent?._id) refetchReviewable();
  }, [token, stockCurrent?._id]);

  useEffect(() => {
    if (reviewable) {
      setRating(reviewable.rating > 0 ? reviewable.rating : 5);
      setComment(reviewable.comment || "");
    }
  }, [reviewable]);

  useEffect(() => {
    const idx = galleryItems.findIndex((item) => item?.variantId === stockCurrent?._id);
    if (idx >= 0) {
      setImgMain(idx);
      return;
    }
    if (imgMain >= galleryItems.length) {
      setImgMain(0);
    }
  }, [stockCurrent?._id, galleryItems, imgMain]);

  return (
    <Fragment>
      <section className="title-section">
        <div className="section-center">
          <h3>
            <Link to="/">Home</Link>
            <Link to="/products">/ Products</Link> / {detailProduct?.name || "Product detail"}
          </h3>
        </div>
      </section>
      {(isLoading || isFetching) && (
        <div style={{ height: "calc(80vh - 160px)" }}>
          <Loading />
        </div>
      )}
      {!isLoading && !isFetching && (
        <Fragment>
          <div className="section section-center page">
            <Link to="/products" className="btn">
              back to products
            </Link>
            <div className="product-center">
              <section className="img-section">
                <img src={galleryItems[imgMain]?.url || productImageUrl(detailProduct?.images, 0)} alt="" className="main" />
                {galleryItems?.length > 0 && (
                  <div className="gallery">
                    {galleryItems.map((item, index) => (
                      <img
                        key={`${item.variantId || "cover"}-${index}`}
                        src={item.url || productImageUrl(detailProduct?.images, 0)}
                        alt=""
                        className={`${imgMain === index ? "active" : ""}`}
                        onClick={() => {
                          setImgMain(index);
                          if (item?.color) setSelectedColor(item.color);
                          if (item?.size) setSelectedSize(item.size);
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
              <section className="content">
                <h2>{detailProduct?.name}</h2>
                <h5>{formatCurrency(stockCurrent?.price ?? detailProduct?.price)}</h5>
                {detailProduct?.description ? (
                  <p className="description">{detailProduct.description}</p>
                ) : null}
                <p className="info"><span>Category:</span> {labelForCategory(detailProduct?.category)}</p>
                <p className="info"><span>Brand:</span> {labelForBrand(detailProduct?.company)}</p>

                <div className="colors-single-product info">
                  <span>Color:</span>
                  <div style={{ display: "flex" }}>
                    {colorList.map((color) => {
                      const hex = variants.find((v) => v?.color === color)?.hex;
                      const swatch = hex?.startsWith("#") ? hex : "#e8e8e8";
                      const isActive = selectedColor === color;
                      const tickColor = isLightColor(swatch) ? "#222" : "#fff";
                      return (
                        <button
                          key={color}
                          type="button"
                          title={color}
                          className={`color-btn${isActive ? " active" : ""}`}
                          style={{
                            backgroundColor: swatch,
                            border: isActive
                              ? `2px solid ${tickColor === "#fff" ? "#888" : "#444"}`
                              : "1px solid #dedede",
                            color: isActive ? tickColor : "transparent",
                          }}
                          onClick={() => {
                            setSelectedColor(color);
                            const first = variants.find((v) => v?.color === color);
                            setSelectedSize(first?.size || "M");
                            setAmountProduct(1);
                            setImgMain(0);
                          }}
                        >
                          <BsCheck className="check-icon" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="info" style={{ marginBottom: 12 }}>
                  <span>Size:</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {sizesOfColor.map((sz) => {
                      const isActive = selectedSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          style={{
                            padding: "5px 14px",
                            borderRadius: "var(--radius)",
                            border: `2px solid var(--clr-primary-5)`,
                            background: isActive ? "var(--clr-primary-5)" : "transparent",
                            color: isActive ? "#fff" : "var(--clr-primary-3)",
                            fontWeight: isActive ? 600 : 400,
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            transition: "var(--transition)",
                          }}
                          onClick={() => {
                            setSelectedSize(sz);
                            setAmountProduct(1);
                            setImgMain(0);
                          }}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="btn-cart-container">
                  {(stockCurrent?.amount ?? 0) > 0 && (
                    <div className="amounts-btn">
                      <button
                        disabled={amountProduct === 1}
                        type="button"
                        className="dec-btn"
                        onClick={() =>
                          setAmountProduct(Math.max(1, amountProduct - 1))
                        }
                      >
                        <AiOutlineMinus />
                      </button>
                      <h2>{amountProduct}</h2>
                      <button
                        disabled={amountProduct >= (stockCurrent?.amount || 0)}
                        type="button"
                        className="inc-btn"
                        onClick={() =>
                          setAmountProduct(
                            Math.min(stockCurrent?.amount || 1, amountProduct + 1)
                          )
                        }
                      >
                        <AiOutlinePlus />
                      </button>
                    </div>
                  )}
                  {((stockCurrent?.amount ?? 0) > 0) && (
                    <p style={{ margin: 0, marginTop: -8, color: "#999", fontSize: 12 }}>
                      Remaining stock: {stockCurrent?.amount ?? 0}
                    </p>
                  )}

                  {!token ? (
                    <button className="btn" onClick={() => navigate("/login")}>
                      Log in to buy
                    </button>
                  ) : (stockCurrent?.amount ?? 0) === 0 ? (
                    <button className="btn disabled" disabled>
                      Sold out
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <button className="btn" onClick={handleBuyNow}>
                        Buy now
                      </button>
                      <button
                        className="btn"
                        onClick={handleClickAddCartItem}
                        style={{
                          background: "transparent",
                          border: "1px solid var(--clr-primary-5)",
                          color: "var(--clr-primary-5)",
                          boxShadow: "none",
                        }}
                      >
                        Add to cart
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="section section-center page" style={{ marginTop: 0 }}>
            <h3>Reviews</h3>
            {(reviews || []).length === 0 && <p>No reviews yet.</p>}
            {(reviews || []).map((rv) => (
              <div
                key={`${rv.orderId}-${rv.variantId}-${rv.reviewedAt}`}
                style={{
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong>{rv.reviewerName || "Customer"}</strong>
                  <span style={{ marginLeft: 8, color: "#ab7a5f" }}>
                    {"★".repeat(rv.rating || 0)}
                  </span>
                  {rv.variantTitle ? (
                    <div style={{ color: "#999", fontSize: 13 }}>{rv.variantTitle}</div>
                  ) : null}
                  <div style={{ marginTop: 4 }}>{rv.comment || "No comment"}</div>
                </div>
                {token &&
                  isOwnReview(rv) &&
                  ((rv.rating ?? 0) > 0 || reviewable?.hasReview) && (
                  <button
                    type="button"
                    title="Edit your review"
                    aria-label="Edit your review"
                    onClick={() => openReviewModal(rv)}
                    style={{
                      flexShrink: 0,
                      background: "transparent",
                      border: "1px solid #dedede",
                      borderRadius: 6,
                      padding: "6px 10px",
                      cursor: "pointer",
                      color: "var(--clr-primary-5)",
                      lineHeight: 0,
                    }}
                  >
                    <AiOutlineEdit size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Modal
            title="Edit review"
            open={reviewModalOpen}
            onCancel={() => setReviewModalOpen(false)}
            onOk={handleSubmitReview}
            okText={mutateReview.isLoading ? "Saving..." : "Save"}
            cancelText="Cancel"
            confirmLoading={mutateReview.isLoading}
            destroyOnClose
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
                  Rating (1–5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) =>
                    setRating(Math.min(5, Math.max(1, Number(e.target.value || 5))))
                  }
                  style={{ width: "100%", padding: "8px 10px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
                  Comment
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Your comment"
                  style={{ width: "100%", padding: "8px 10px", resize: "vertical" }}
                />
              </div>
            </div>
          </Modal>
        </Fragment>
      )}
    </Fragment>
  );
};

export default ProductDetailPage;
