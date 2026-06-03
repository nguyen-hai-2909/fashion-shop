import { useQuery } from "@tanstack/react-query";
import { Flex, Input } from "antd";
import { Fragment, useCallback, useContext, useMemo, useState } from "react";
import HeaderTable from "../../../common/HeaderTable";
import Paper from "../../../common/Paper";
import { adminContext } from "../../../context/AdminContext";
import { canWriteAdminData } from "../../../utils/adminPermission";
import { DeleteCategoryService, GetCategoriesService } from "../../../services/CategoryService";
import CategoryList from "./CategoryList/CategoryList";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";

const Category = () => {
  const { admin, tokenAdmin } = useContext(adminContext);
  const canWrite = canWriteAdminData(admin?.role);
  const [q, setQ] = useState("");
  const [categoryValue, setCategoryValue] = useState(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const { data, isFetching, refetch } = useQuery(
    ["categories-admin"],
    () => GetCategoriesService({ all: true }),
    { enabled: Boolean(tokenAdmin) }
  );

  const deleteMut = useMutation({
    mutationFn: (id) => DeleteCategoryService(id, tokenAdmin),
  });

  const rows = useMemo(() => {
    const list = data?.data || [];
    const key = q.trim().toLowerCase();
    if (!key) return list;
    return list.filter(
      (c) =>
        String(c?.name || "").toLowerCase().includes(key) ||
        String(c?.slug || "").toLowerCase().includes(key)
    );
  }, [data?.data, q]);

  const handleDelete = useCallback(async () => {
    try {
      await Promise.all(selectedRowKeys.map((id) => deleteMut.mutateAsync(id)));
      toast.success(
        selectedRowKeys.length === 1
          ? "Category deleted"
          : `${selectedRowKeys.length} categories deleted`
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
        title="Categories"
        isCreate={canWrite}
        isDelete={canWrite}
        onCreate={() => {
          setCategoryValue(null);
          setIsOpenDrawer(true);
        }}
        onRefetch={refetch}
        selectedRowKeys={selectedRowKeys}
        onDelete={handleDelete}
        isLoadingDelete={deleteMut.isLoading}
        isOpenModal={isOpenModal}
        handleChangeModal={() => setIsOpenModal((v) => !v)}
        deleteEntity="category"
      />
      <Paper isFix={true}>
        <Flex style={{ marginBottom: 12 }}>
          <Input.Search
            placeholder="Search by name or slug"
            allowClear
            style={{ maxWidth: 420 }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={(v) => setQ(v ?? "")}
          />
        </Flex>
        <CategoryList
          isLoading={isFetching}
          data={rows}
          q={q}
          categoryValue={categoryValue}
          setCategoryValue={setCategoryValue}
          isOpenDrawer={isOpenDrawer}
          setIsOpenDrawer={setIsOpenDrawer}
          refetch={refetch}
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
          canWrite={canWrite}
        />
      </Paper>
    </Fragment>
  );
};

export default Category;
