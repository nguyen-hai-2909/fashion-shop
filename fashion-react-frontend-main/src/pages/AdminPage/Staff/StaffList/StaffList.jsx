/* eslint-disable react/prop-types */
import { SettingOutlined } from "@ant-design/icons";
import { Button, Table, Tag } from "antd";
import { Fragment, useCallback } from "react";
import Highlighter from "react-highlight-words";
import StaffDrawer from "../StaffDrawer/StaffDrawer";

const StaffList = ({
  isLoading,
  data,
  q,
  staffValue,
  setStaffValue,
  isOpenDrawer,
  setIsOpenDrawer,
  refetch,
  selectedRowKeys,
  setSelectedRowKeys,
}) => {
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
    setStaffValue(null);
  }, [setStaffValue, setIsOpenDrawer]);

  const columns = [
    { title: "Name", dataIndex: "name", render: (text) => hi(text) },
    { title: "Email", dataIndex: "email", ellipsis: true, render: (text) => hi(text) },
    { title: "Phone", dataIndex: "phoneNumber", width: 140, render: (text) => hi(text) },
    {
      title: "Role",
      dataIndex: "role",
      width: 110,
      render: (role) => (
        <Tag color={role === "manager" ? "blue" : "default"}>
          {role === "manager" ? "Manager" : "Staff"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "locked",
      width: 100,
      render: (locked) =>
        locked ? <Tag color="red">Locked</Tag> : <Tag color="green">Active</Tag>,
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
            setStaffValue(item);
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
        <StaffDrawer
          staff={staffValue}
          isOpen={isOpenDrawer}
          onClose={handleCloseDrawer}
          refetch={refetch}
        />
      )}
    </Fragment>
  );
};

export default StaffList;
