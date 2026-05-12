/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { categoryList, companyList, storefrontFilterCopy } from "../../constants";
import { formatCurrency } from "../../utils";

const FilterProductsPage = (props) => {
  const { query, handleChangeQuery, handleClearFilter, queryDebounce, setQueryDebounce } =
    props;

  const copy = storefrontFilterCopy;

  return (
    <div className="classify-options">
      <div className="content">
        <form>
          <div className="form-control">
            <input
              type="text"
              name="name"
              placeholder={copy.searchPlaceholder}
              className="search-input"
              value={queryDebounce?.name}
              onChange={(e) =>
                setQueryDebounce((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
          <div className="form-control">
            <h5>{copy.category}</h5>
            <div className="wrap-category">
              <button
                type="button"
                name="category"
                className={`${query?.category === "" ? "null active" : "null"}`}
                value={""}
                onClick={handleChangeQuery}
              >
                {copy.all}
              </button>
              {categoryList &&
                categoryList.map((item, index) => (
                  <button
                    type="button"
                    key={index}
                    name="category"
                    value={item.value}
                    className={`${
                      item.value === query?.category ? "null active" : "null"
                    }`}
                    onClick={handleChangeQuery}
                  >
                    {item.label}
                  </button>
                ))}
            </div>
          </div>
          <div className="form-control">
            <h5>{copy.brand}</h5>
            <select
              name="company"
              className="company"
              value={query?.company}
              onChange={handleChangeQuery}
            >
              <option value="all">{copy.all}</option>
              {companyList &&
                companyList.map((item, index) => (
                  <option key={index} value={item?.value}>
                    {item?.label}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-control">
            <h5>{copy.price}</h5>
            <p className="price">{formatCurrency(queryDebounce?.price)}</p>
            <input
              type="range"
              min="0"
              max="5000000"
              name="price"
              value={queryDebounce?.price}
              onChange={(e) =>
                setQueryDebounce((prev) => ({
                  ...prev,
                  price: e.target.value,
                }))
              }
            />
          </div>
        </form>
        <button type="button" className="clear-btn" onClick={handleClearFilter}>
          {copy.clearFilters}
        </button>
      </div>
    </div>
  );
};

export default FilterProductsPage;
