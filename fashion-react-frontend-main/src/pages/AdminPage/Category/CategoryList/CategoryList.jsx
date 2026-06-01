/* eslint-disable react/prop-types */
import { SettingOutlined } from "@ant-design/icons";
import { Button, Switch, Table } from "antd";
import { Fragment, useCallback, useContext } from "react";
import Highlighter from "react-highlight-words";
import CategoryDrawer from "../CategoryDrawer/CategoryDrawer";
import { useMutation } from "@tanstack/react-query";
import { ToggleCategoryService } from "../../../../services/CategoryService";
import { adminContext } from "../../../../context/AdminContext";

const CategoryList = ({
  isLoading,
  data,
  q,
  categoryValue,
  setCategoryValue,
  isOpenDrawer,
  setIsOpenDrawer,
  refetch,
  selectedRowKeys,
  setSelectedRowKeys,
}) => {
  const { tokenAdmin } = useContext(adminContext);

  const toggleMut = useMutation({
    mutationFn: (id) => ToggleCategoryService(id, tokenAdmin),
  });

  const hi = (text) => {
    const t = text == null ? "" : String(text);
    return q?.trim() ? (
      <Highlighter
        searchWords={[q.trim()]}
        autoEscape
        textToHighlight={t}
        highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
      />
    ) : (
      t || "—"
    );
  };

  const handleCloseDrawer = useCallback(() => {
    setIsOpenDrawer(false);
    setCategoryValue(null);
  }, [setCategoryValue, setIsOpenDrawer]);

  const columns = [
    { title: "Name", dataIndex: "name", render: (text) => hi(text) },
    { title: "Slug", dataIndex: "slug", render: (text) => hi(text) },
    {
      title: "Active",
      dataIndex: "isActive",
      width: 100,
      render: (_, row) => (
        <Switch
          checked={row?.isActive !== false}
          loading={toggleMut.isLoading}
          onChange={async () => {
            const res = await toggleMut.mutateAsync(row._id);
            if (res?.success) refetch?.();
          }}
        />
      ),
    },
    {
      title: "Actions",
      dataIndex: "_id",
      align: "center",
      width: 100,
      render: (_, item) => (
        <Button
          type="primary"
          ghost
          icon={<SettingOutlined />}
          onClick={() => {
            setCategoryValue(item);
            setIsOpenDrawer(true);
          }}
        />
      ),
    },
  ];

  return (
    <Fragment>
      <Table
        rowKey="_id"
        bordered
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={false}
      />
      {isOpenDrawer && (
        <CategoryDrawer
          category={categoryValue}
          isOpen={isOpenDrawer}
          onClose={handleCloseDrawer}
          refetch={refetch}
        />
      )}
    </Fragment>
  );
};

export default CategoryList;
