import { Link } from "react-router-dom";
import urlImg1 from "../../assets/images/img_home1.jpeg";
import urlImg2 from "../../assets/images/img_home2.jpeg";
const InfoShop = () => {
  return (
    <section className="section-center home-title">
      <article className="content">
        <h1>Fashion & accessories — your style</h1>
        <p>
          Curated clothing, footwear, and accessories. Shop online with fast
          delivery and easy returns — new trends every season.
        </p>
        <Link className="btn btn-product" to="/products">
          shop now
        </Link>
      </article>
      <article className="img-container">
        <img src={urlImg1} alt="" className="main-img" />
        <img src={urlImg2} alt="" className="accent-img" />
      </article>
    </section>
  );
};

export default InfoShop;
