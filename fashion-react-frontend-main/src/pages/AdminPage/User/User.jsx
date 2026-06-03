import { useMutation, useQuery } from "@tanstack/react-query";
import { Fragment, useCallback, useContext, useState } from "react";
import { Flex, Input } from "antd";
import HeaderTable from "../../../common/HeaderTable";
import Paper from "../../../common/Paper";
import {
  DeleteUserAdminService,
  GetUserAdminService,
} from "../../../services/AdminService";
import UserList from "./UserList/UserList";
import { adminContext } from "../../../context/AdminContext";
import { canWriteAdminData } from "../../../utils/adminPermission";
import { toast } from "react-toastify";

const User = () => {
  const { admin, tokenAdmin, dispatch } = useContext(adminContext);
  const canWrite = canWriteAdminData(admin?.role);

  const [data, setData] = useState([]);
  const [customerValue, setCustomerValue] = useState(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
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

  const deleteMut = useMutation({
    mutationFn: (id) => DeleteUserAdminService(id, tokenAdmin),
  });

  const handleDelete = useCallback(async () => {
    try {
      await Promise.all(selectedRowKeys.map((id) => deleteMut.mutateAsync(id)));
      toast.success(
        selectedRowKeys.length === 1
          ? "Customer deleted"
          : `${selectedRowKeys.length} customers deleted`
      );
      setSelectedRowKeys([]);
      setIsOpenModal(false);
      refetch();
    } catch (e) {
      toast.error(e.message || "Delete failed");
    }
  }, [selectedRowKeys, deleteMut, refetch]);

  return (
    <Fragment>
      <HeaderTable
        title="Customers"
        deleteEntity="customer"
        isCreate={canWrite}
        isDelete={canWrite}
        selectedRowKeys={selectedRowKeys}
        onRefetch={refetch}
        onCreate={() => {
          setCustomerValue(null);
          setIsOpenDrawer(true);
        }}
        onDelete={handleDelete}
        isLoadingDelete={deleteMut.isLoading}
        isOpenModal={isOpenModal}
        handleChangeModal={() => setIsOpenModal((v) => !v)}
      />
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
          tokenAdmin={tokenAdmin}
          canWrite={canWrite}
          onRefetch={refetch}
          customerValue={customerValue}
          setCustomerValue={setCustomerValue}
          isOpenDrawer={isOpenDrawer}
          setIsOpenDrawer={setIsOpenDrawer}
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
        />
      </Paper>
    </Fragment>
  );
};

export default User;
