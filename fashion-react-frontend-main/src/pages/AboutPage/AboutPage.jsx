import { Fragment } from "react";
import imgAbout from "../../assets/images/img_about.jpg";
const AboutPage = () => {
  return (
    <Fragment>
      <section className="title-section">
        <div className="section-center">
          <h3>
            <a href="/">Home</a> / about
          </h3>
        </div>
      </section>
      <section className="page section section-center about-section">
        <img src={imgAbout} alt="" />
        <article>
          <div className="title">
            <h2>our story</h2>
            <div className="underline" />
          </div>
          <p>
            We started with a simple idea: wardrobe essentials should feel
            considered—fabrics that breathe, silhouettes that flatter, and
            details that elevate everyday dressing. Today we bring together
            seasonal edits, trusted brands, and our own labels so you can mix
            statement pieces with staples that work Monday through Sunday.
            Whether you are refreshing your closet or hunting for that one
            perfect layer, we are here to make shopping straightforward,
            inspiring, and true to your style.
          </p>
        </article>
      </section>
    </Fragment>
  );
};

export default AboutPage;
