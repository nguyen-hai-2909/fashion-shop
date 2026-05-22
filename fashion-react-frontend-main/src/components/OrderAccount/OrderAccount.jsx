import { useQuery } from "@tanstack/react-query";
import { Fragment, useContext, useEffect, useState } from "react";
import { authContext } from "../../context/AuthContext";
import { GetAllOrderUserService } from "../../services/OrderService";
import OrderAccountList from "./OrderAccountList/OrderAccountList";

const OrderAccount = () => {
  const { dispatch, token } = useContext(authContext);
  //! Props

  //! State
  const [query, setQuery] = useState({
    page: 1,
    totalPage: 1,
    email: "",
  });
  const [data, setData] = useState([]);
  const { isLoading, isFetching, refetch } = useQuery(
    ["order-user"],
    () =>
      GetAllOrderUserService({ email: query.email, page: query.page }, token),
    {
      enabled: false,
      onSuccess: (response) => {
        const { page, data, success } = response;
        if (success) {
          setData(data);
          setQuery((prev) => {
            return {
              ...prev,
              page: page?.currentPage,
              totalPage: page?.totalPage,
            };
          });
        } else {
          if (response?.statusCode == 404) {
            dispatch({ type: "LOG_OUT" });
          }
        }
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
    <Fragment>
      <h3
        style={{
          marginBottom: "1.5rem",
          textTransform: "unset",
          letterSpacing: "unset",
          color: "#453227",
        }}
      >
        Order
      </h3>
      <OrderAccountList
        data={data}
        query={query}
        setQuery={setQuery}
        isLoading={isFetching || isLoading}
      />
    </Fragment>
  );
};

export default OrderAccount;
