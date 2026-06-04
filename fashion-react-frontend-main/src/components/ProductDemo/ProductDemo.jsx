import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GetAllProductsService } from "../../services/ProductService";
import { useEffect, useState } from "react";
import Loading from "../Loader/Loading";
import { productImageUrl } from "../../utils";
import ProductPriceDisplay, {
  ProductDiscountBadge,
} from "../ProductPrice/ProductPriceDisplay";

const ProductDemo = () => {
  //! Props

  //! State
  const [productsData, setProductsData] = useState([]);
  const { isLoading, isFetching, refetch } = useQuery(
    ["products-demo"],
    () => GetAllProductsService({}),
    {
      enabled: false,
      onSuccess: (response) => {
        setProductsData(response?.products);
      },
    }
  );
  //! Function

  //! Effect
  useEffect(() => {
    refetch && refetch();
  }, []);
  //! Render
  return (
    <section className="products-demo">
      <div className="section-center">
        <div className="title">
          <h2>Featured products</h2>
          <div className="underline" />
        </div>
      </div>
      <div className="section-center featured-wrap">
        {(isLoading || isFetching) && <Loading />}
        {(productsData || [])?.slice(0, 6).map((product) => {
          const { _id, slug, name, images, variants } = product;
          const productPath = slug ? `/products/${slug}` : "/products";
          const soldOut =
            !Array.isArray(variants) ||
            variants.length === 0 ||
            variants.every((v) => Number(v?.inventory || 0) <= 0);
          const firstImage = productImageUrl(images, 0);
          const secondImage = productImageUrl(images, 1);
          const hasSecondImage = secondImage !== firstImage;

          return (
            <article key={_id} className="featured-shop-card">
              <div className="featured-shop-img">
                <ProductDiscountBadge product={product} />
                {soldOut && <span className="featured-shop-badge">Sold out</span>}
                <Link to={productPath} aria-label={`View details for ${name}`}>
                  <img className="first-image" src={firstImage} alt={name} />
                  {hasSecondImage && (
                    <img className="second-image" src={secondImage} alt={name} />
                  )}
                </Link>
              </div>
              <div className="featured-shop-detail">
                <h5 title={name}>{name}</h5>
                <ProductPriceDisplay product={product} />
              </div>
            </article>
          );
        })}
      </div>
      <Link to="/products" className="btn">
        All products
      </Link>
    </section>
  );
};

export default ProductDemo;
