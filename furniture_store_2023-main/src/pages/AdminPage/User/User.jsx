import { useQuery } from "@tanstack/react-query";
import { Fragment, useContext, useState } from "react";
import { Flex, Input } from "antd";
import HeaderTable from "../../../common/HeaderTable";
import Paper from "../../../common/Paper";
import { GetUserAdminService } from "../../../services/AdminService";
import UserList from "./UserList/UserList";
import { adminContext } from "../../../context/AdminContext";

const User = () => {
  const { tokenAdmin, dispatch } = useContext(adminContext);

  const [data, setData] = useState([]);
  const [query, setQuery] = useState({
    q: "",
    page: 1,
    totalPage: 1,
  });

  const { isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-user-list", query.page, query.q, tokenAdmin],
    queryFn: () =>
      GetUserAdminService(
        {
          q: query.q,
          page: query.page,
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
      <HeaderTable onRefetch={refetch} title="Customers" />
      <Paper isFix={true}>
        <Flex style={{ marginBottom: 12 }}>
          <Input.Search
            placeholder="Search by email, name, or phone"
            allowClear
            style={{ maxWidth: 420 }}
            value={query.q}
            onChange={(e) =>
              setQuery((p) => ({ ...p, page: 1, q: e.target.value }))
            }
            onSearch={(v) => setQuery((p) => ({ ...p, page: 1, q: v ?? "" }))}
          />
        </Flex>
        <UserList
          isLoading={isLoading || isFetching}
          data={data}
          query={query}
          setQuery={setQuery}
        />
      </Paper>
    </Fragment>
  );
};

export default User;
