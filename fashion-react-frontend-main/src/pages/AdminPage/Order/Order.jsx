import { useQuery } from "@tanstack/react-query";
import { Fragment, useContext, useState } from "react";
import { Flex, Input, Select } from "antd";
import HeaderTable from "../../../common/HeaderTable";
import Paper from "../../../common/Paper";
import { adminContext } from "../../../context/AdminContext";
import { GetOrderAdminService } from "../../../services/AdminService";
import OrderList from "./OrderList/OrderList";

const Order = () => {
  const { dispatch, tokenAdmin } = useContext(adminContext);

  const [data, setData] = useState([]);
  const [query, setQuery] = useState({
    q: "",
    page: 1,
    totalPage: 1,
    status: [],
    sortBy: "updated_at",
    sortDir: "desc",
  });

  const { isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "admin-order-list",
      query.page,
      query.q,
      query.status,
      query.sortBy,
      query.sortDir,
      tokenAdmin,
    ],
    queryFn: () =>
      GetOrderAdminService(
        {
          q: query.q,
          page: query.page,
          status: query.status,
          sortBy: query.sortBy,
          sortDir: query.sortDir,
        },
        tokenAdmin
      ),
    enabled: Boolean(tokenAdmin),
    onSuccess: (response) => {
      const { data, page, success } = response || {};
      if (success) {
        setQuery((prev) => ({
          ...prev,
          page: Number(page?.currentPage),
          totalPage: Number(page?.totalPage),
        }));
        setData(data);
      } else if (response?.statusCode === 404) {
        dispatch({ type: "LOG_OUT" });
      }
    },
  });

  return (
    <Fragment>
      <HeaderTable onRefetch={refetch} title="Orders" />
      <Paper isFix={true}>
        <Flex gap="middle" wrap="wrap" align="center" style={{ marginBottom: 12 }}>
          <Input.Search
            placeholder="Search email, name, phone, or order #"
            allowClear
            style={{ minWidth: 280, maxWidth: 420, flex: 1 }}
            value={query.q}
            onChange={(e) =>
              setQuery((p) => ({ ...p, page: 1, q: e.target.value }))
            }
            onSearch={(v) => setQuery((p) => ({ ...p, page: 1, q: v ?? "" }))}
          />
          <Select
            style={{ width: 120 }}
            value={query.sortDir}
            onChange={(sortDir) =>
              setQuery((p) => ({ ...p, page: 1, sortDir }))
            }
            options={[
              { value: "desc", label: "Newest" },
              { value: "asc", label: "Oldest" },
            ]}
          />
        </Flex>
        <OrderList
          isLoading={isLoading || isFetching}
          data={data}
          query={query}
          setQuery={setQuery}
        />
      </Paper>
    </Fragment>
  );
};

export default Order;
