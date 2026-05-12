import { Fragment, useCallback, useContext, useState } from "react";
import { adminContext } from "../../../context/AdminContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  DeleteMultiDiscountService,
  GetAllDiscountService,
} from "../../../services/DiscountService";
import { Flex, Input } from "antd";
import HeaderTable from "../../../common/HeaderTable";
import Paper from "../../../common/Paper";
import DiscountList from "./DiscountList/DiscountList";
import { toast } from "react-toastify";

const Discount = () => {
  const { tokenAdmin, dispatch } = useContext(adminContext);

  const [discountValue, setDiscountValue] = useState(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [data, setData] = useState([]);
  const [query, setQuery] = useState({
    q: "",
    page: 1,
    totalPage: 10,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const { isLoading, isFetching, refetch } = useQuery({
    queryKey: ["list-discount", query.page, query.q, tokenAdmin],
    queryFn: () =>
      GetAllDiscountService(tokenAdmin, {
        q: query.q,
        page: query.page,
      }),
    enabled: Boolean(tokenAdmin),
    onSuccess: (response) => {
      const { success, data, page } = response || {};
      if (success) {
        setData(data);
        setQuery((prev) => ({
          ...prev,
          page: Number(page?.currentPage),
          totalPage: Number(page?.totalPage),
        }));
      } else if (response?.statusCode === 404) {
        dispatch({ type: "LOG_OUT" });
      }
    },
  });

  const mutateRemoves = useMutation({
    mutationFn: (ids) => DeleteMultiDiscountService(ids, tokenAdmin),
  });

  const handleDelete = useCallback(async () => {
    try {
      const ids = `ids[]=${selectedRowKeys.join("&ids[]=")}`;
      const response = await mutateRemoves.mutateAsync(ids);
      const { success, message } = response;
      if (!success) {
        throw new Error(message);
      }
      toast.success(message);
      refetch && refetch();
      setIsOpenModal(false);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }, [selectedRowKeys, mutateRemoves, refetch]);

  const handleChangeModal = useCallback(
    () => setIsOpenModal((active) => !active),
    []
  );

  return (
    <Fragment>
      <HeaderTable
        title="Discount codes"
        deleteEntity="discount"
        isCreate={true}
        isDelete={true}
        selectedRowKeys={selectedRowKeys}
        onRefetch={refetch}
        onCreate={() => {
          setIsOpenDrawer(true);
        }}
        onDelete={handleDelete}
        isLoadingDelete={mutateRemoves.isLoading}
        isOpenModal={isOpenModal}
        handleChangeModal={handleChangeModal}
      />
      <Paper isFix={true}>
        <Flex style={{ marginBottom: 12 }}>
          <Input.Search
            placeholder="Search by code, value, or description"
            allowClear
            style={{ maxWidth: 420 }}
            value={query.q}
            onChange={(e) =>
              setQuery((p) => ({ ...p, page: 1, q: e.target.value }))
            }
            onSearch={(v) => setQuery((p) => ({ ...p, page: 1, q: v ?? "" }))}
          />
        </Flex>
        <DiscountList
          isLoading={isLoading || isFetching}
          data={data}
          query={query}
          setQuery={setQuery}
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          isOpenDrawer={isOpenDrawer}
          setIsOpenDrawer={setIsOpenDrawer}
          refetch={refetch}
        />
      </Paper>
    </Fragment>
  );
};

export default Discount;
