import { Fragment, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FilterProductsPage from "../../components/FilterProducts/FilterProductsPage";
import SortProducts from "../../components/SortProducts/SortProducts";
import ViewProductsPage from "../../components/ProductsRender/ViewProductsPage";
import { getSortType, getTypeRender } from "../../utils";
import { useQuery } from "@tanstack/react-query";
import { GetAllProductsService } from "../../services/ProductService";

const ProductsPage = () => {
  //! Props

  //! State
  const [isTypeRender, setIsTypeRender] = useState(getTypeRender());
  const [query, setQuery] = useState({
    name: "",
    category: "",
    company: "",
    price: 3000000,
    sort: getSortType(),
  });
  const [dataProducts, setDataProducts] = useState([]);
  const { isLoading, isFetching, refetch } = useQuery(
    ["products-list"],
    () => GetAllProductsService(query),
    {
      enabled: false,
      onSuccess: (response) => {
        setDataProducts(response?.products);
      },
    }
  );
  const [queryDebounce, setQueryDebounce] = useState({
    name: query.name,
    price: query.price,
  });
  //! Function
  const handleChangeQuery = useCallback((e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "company" && (value === "all" || value === "All") ? "" : value;
    setQuery((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  }, []);
  const handleClearFilter = useCallback(() => {
    setQuery((prev) => {
      return {
        ...prev,
        name: "",
        category: "",
        company: "",
        price: 3000000,
        sort: getSortType(),
      };
    });
    setQueryDebounce({
      name: query.name,
      price: query.price,
    });
  }, []);
  //! Effect
  useEffect(() => {
    refetch && refetch();
  }, [query]);

  useEffect(() => {
    const idTimeout = setTimeout(() => {
      if (queryDebounce.name !== query.name) {
        setQuery((prev) => {
          return {
            ...prev,
            name: queryDebounce.name,
          };
        });
      }
    }, 500);
    return () => clearTimeout(idTimeout);
  }, [queryDebounce.name]);

  useEffect(() => {
    const idTimeout = setTimeout(() => {
      if (queryDebounce.price !== query.price) {
        setQuery((prev) => {
          return {
            ...prev,
            price: queryDebounce.price,
          };
        });
      }
    }, 500);
    return () => clearTimeout(idTimeout);
  }, [queryDebounce.price]);
  //! Render
  return (
    <Fragment>
      <section className="title-section">
        <div className="section-center">
          <h3>
            <Link to="/">Home</Link> / Products
          </h3>
        </div>
      </section>
      <section className="section-center products-section">
        <FilterProductsPage
          query={query}
          handleChangeQuery={handleChangeQuery}
          handleClearFilter={handleClearFilter}
          setQuery={setQuery}
          queryDebounce={queryDebounce}
          setQueryDebounce={setQueryDebounce}
        />
        <div>
          <SortProducts
            isTypeRender={isTypeRender}
            setIsTypeRender={setIsTypeRender}
            query={query}
            handleChangeQuery={handleChangeQuery}
            productLength={dataProducts?.length || 0}
          />
          <ViewProductsPage
            query={query}
            isTypeRender={isTypeRender}
            dataProducts={dataProducts}
            isLoading={isLoading || isFetching}
          />
        </div>
      </section>
    </Fragment>
  );
};

export default ProductsPage;
