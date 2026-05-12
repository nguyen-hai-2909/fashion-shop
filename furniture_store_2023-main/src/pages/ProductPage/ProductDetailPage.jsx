import { useMutation, useQuery } from "@tanstack/react-query";
import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/Loader/Loading";
import { GetDetailProductService } from "../../services/ProductService";
import { BsCheck } from "react-icons/bs";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { cartContext } from "../../context/CartContext";
import { toast } from "react-toastify";
import { formatCurrency, productImageUrl } from "../../utils";
import { labelForBrand, labelForCategory } from "../../constants";
import { authContext } from "../../context/AuthContext";
import {
  GetProductReviewsService,
  GetReviewableService,
  SubmitReviewService,
} from "../../services/ReviewService";

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
  const [reviewable, setReviewable] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const resolvedProductId = detailProduct?._id || identifier;

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
    ["product-reviews", resolvedProductId],
    () => GetProductReviewsService(resolvedProductId),
    {
      enabled: false,
      onSuccess: (res) => {
        if (res?.success) setReviews(res.data || []);
      },
    }
  );

  const { refetch: refetchReviewable } = useQuery(
    ["reviewable", resolvedProductId, stockCurrent?._id],
    () => GetReviewableService({ productId: resolvedProductId, variantId: stockCurrent?._id }, token),
    {
      enabled: false,
      onSuccess: (res) => {
        setReviewable(!!res?.success);
      },
    }
  );

  const mutateReview = useMutation({
    mutationFn: (payload) => SubmitReviewService(payload, token),
  });

  const handleClickAddCartItem = useCallback(() => {
    if (!detailProduct || !stockCurrent) return;
    const colorForCart =
      typeof stockCurrent.color === "object" && stockCurrent.color != null
        ? stockCurrent.color.name || stockCurrent.color.label || ""
        : stockCurrent.color;
    dispatch({
      type: "ADD_PRODUCT_TO_CART",
      payload: {
        product: {
          id: `${resolvedProductId}_${stockCurrent._id}`,
          slug: detailProduct.slug,
          price: stockCurrent.price ?? detailProduct.price,
          color: colorForCart,
          size: stockCurrent.size,
          amount: amountProduct,
          maxAmount: stockCurrent.amount,
          name: detailProduct.name,
          image: { url: stockCurrent.imageUrl || detailProduct.images?.[0]?.url || "" },
        },
      },
    });
    toast.success("Add product successfully");
  }, [detailProduct, stockCurrent, amountProduct, dispatch, resolvedProductId]);

  const handleBuyNow = useCallback(() => {
    if (!detailProduct || !stockCurrent) return;
    if ((stockCurrent?.amount ?? 0) <= 0) return;
    // Shop behavior: add to cart then go to checkout.
    handleClickAddCartItem();
    navigate("/checkout");
  }, [detailProduct, stockCurrent, handleClickAddCartItem, navigate]);

  const handleSubmitReview = useCallback(async () => {
    if (!stockCurrent?._id) return;
    const res = await mutateReview.mutateAsync({
      productId: resolvedProductId,
      variantId: stockCurrent._id,
      rating,
      comment,
    });
    if (!res?.success) {
      toast.error(res?.message || "Submit review failed");
      return;
    }
    toast.success(res.message);
    refetchReviews();
  }, [stockCurrent?._id, rating, comment, resolvedProductId]);

  useEffect(() => {
    refetch();
  }, [identifier]);

  useEffect(() => {
    if (resolvedProductId) {
      refetchReviews();
    }
  }, [resolvedProductId]);

  useEffect(() => {
    if (token && stockCurrent?._id) refetchReviewable();
  }, [token, stockCurrent?._id]);

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
                      const swatch = hex || color;
                      return (
                        <button
                          key={color}
                          type="button"
                          title={color}
                          className={`${selectedColor === color ? "color-btn active" : "color-btn"}`}
                          style={{ backgroundColor: swatch?.startsWith("#") ? swatch : "#e8e8e8", border: "1px solid #dedede" }}
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
                  <div style={{ display: "flex", gap: 8 }}>
                    {sizesOfColor.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        className={`btn ${selectedSize === sz ? "" : "btn-light"}`}
                        style={{ padding: "6px 12px" }}
                        onClick={() => {
                          setSelectedSize(sz);
                          setAmountProduct(1);
                          setImgMain(0);
                        }}
                      >
                        {sz}
                      </button>
                    ))}
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
              <div key={`${rv.orderId}-${rv.variantId}-${rv.reviewedAt}`} style={{ marginBottom: 12 }}>
                <strong>{rv.userEmail}</strong> - {"★".repeat(rv.rating || 0)}
                <div style={{ color: "#999" }}>{rv.variantTitle || ""}</div>
                <div>{rv.comment || "No comment"}</div>
              </div>
            ))}
            {token && (
              <div style={{ marginTop: 18 }}>
                <h4>Write a review</h4>
                {!reviewable ? (
                  <p style={{ color: "#999" }}>You can review this item only after your order is delivered.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 460 }}>
                    <input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value || 5))} />
                    <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Your comment" />
                    <button className="btn" onClick={handleSubmitReview} disabled={mutateReview.isLoading}>
                      {mutateReview.isLoading ? "Submitting..." : "Submit review"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default ProductDetailPage;
