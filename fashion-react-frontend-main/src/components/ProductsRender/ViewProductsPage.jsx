/* eslint-disable react/prop-types */
import { Fragment } from "react";
import Loading from "../Loader/Loading";
import { Link } from "react-router-dom";
import { formatCurrency, productImageUrl } from "../../utils";

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
                const { slug, name, price, images, description } = product;
                const productPath = slug ? `/products/${slug}` : "/products";
                const text = (description || "").slice(0, 150);
                return (
                  <article key={slug || name} className="featured">
                    <div className="container">
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
                        <h5>{name}</h5>
                        <p style={{ textTransform: "unset" }}>{formatCurrency(price)}</p>
                      </div>
                    )}

                    {!isTypeRender && (
                      <div>
                        <h4>{name}</h4>
                        <h5 style={{ textTransform: "unset" }}>{formatCurrency(price)}</h5>
                        <p>{text}...</p>
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
