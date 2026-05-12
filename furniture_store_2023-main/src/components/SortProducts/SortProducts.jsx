/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { AiFillAppstore } from "react-icons/ai";
import { FaBars } from "react-icons/fa";

const SortProducts = (props) => {
  //! Props
  const { isTypeRender, setIsTypeRender, query, handleChangeQuery, productLength } = props;
  //! State

  //! Function

  //! Effect
  useEffect(() => {
    localStorage.setItem("typeRender", isTypeRender);
  }, [isTypeRender]);

  useEffect(() => {
    localStorage.setItem("sortType", query?.sort)
  },[query?.sort])
  //! Render
  return (
    <section className="nav-product">
      <div className="btn-container">
        <button
          className={`${isTypeRender ? "active" : ""}`}
          onClick={() => setIsTypeRender(true)}
        >
          <AiFillAppstore />
        </button>
        <button
          className={`${!isTypeRender ? "active" : ""}`}
          onClick={() => setIsTypeRender(false)}
        >
          <FaBars />
        </button>
      </div>
      <p>{productLength} products found</p>
      <hr />
      <form>
        <label htmlFor="sort">sort by</label>
        <select
          name="sort"
          id="sort"
          className="sort-input"
          onChange={handleChangeQuery}
          value={query?.sort}
        >
          <option value="priceLowest">price (lowest)</option>
          <option value="priceHighest">price (highest)</option>
          <option value="nameA">name (a - z)</option>
          <option value="nameZ">name (z - a)</option>
        </select>
      </form>
    </section>
  );
};

export default SortProducts;
