/* eslint-disable react/prop-types */
import { Fragment } from "react";
import Loading from "../Loader/Loading";
import { Link } from "react-router-dom";
import { productImageUrl } from "../../utils";
import ProductPriceDisplay, {
  ProductDiscountBadge,
} from "../ProductPrice/ProductPriceDisplay";
import { truncateText } from "../../utils/productPricing";

const ViewProductsPage = (props) => {
  //! Props
  const { isTypeRender, dataProducts, isLoading } = props;
  //! State

  //! Function

  //! Effect
  //! Render
  return (
    <Fragment>
      {isLoading && <Loading />}
      {!isLoading && dataProducts?.length === 0 && (
        <h5>Sorry, no products matched your search</h5>
      )}
      {!isLoading && dataProducts?.length > 0 && (
        <Fragment>
          <section className="wrap-product-center">
            <div
              className={`${
                isTypeRender
                  ? "products-container"
                  : "products-container-column"
              }`}
            >
              {(dataProducts || [])?.map((product) => {
                const { slug, name, images } = product;
                const productPath = slug ? `/products/${slug}` : "/products";
                return (
                  <article key={slug || name} className="featured">
                    <div className="container">
                      <ProductDiscountBadge product={product} />
                      <Link
                        to={productPath}
                        aria-label={`View details for ${name}`}
                        style={{ display: "block" }}
                      >
                        <img src={productImageUrl(images, 0)} alt={name} />
                      </Link>
                    </div>
                    {isTypeRender && (
                      <div
                        className="footer-featured"
                        style={{ textTransform: "unset" }}
                      >
                        <h5 title={name}>{truncateText(name, 36)}</h5>
                        <ProductPriceDisplay
                          product={product}
                          className="product-price-block--grid"
                        />
                      </div>
                    )}

                    {!isTypeRender && (
                      <div>
                        <h4 title={name}>{truncateText(name, 45)}</h4>
                        <ProductPriceDisplay
                          product={product}
                          layout="inline"
                          className="product-price-block--list"
                        />
                        <Link to={productPath} className="btn">
                          details
                        </Link>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </Fragment>
      )}
    </Fragment>
  );
};

export default ViewProductsPage;
