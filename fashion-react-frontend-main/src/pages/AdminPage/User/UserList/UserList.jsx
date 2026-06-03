/* eslint-disable react/prop-types */
import { Table, Tag, Popconfirm, Button, Tooltip } from "antd";
import { Fragment, useCallback } from "react";
import Highlighter from "react-highlight-words";
import { useMutation } from "@tanstack/react-query";
import { UpdateUserAdminService } from "../../../../services/AdminService";
import { toast } from "react-toastify";
import { LockOutlined, SettingOutlined, UnlockOutlined } from "@ant-design/icons";
import CustomerDrawer from "../CustomerDrawer/CustomerDrawer";

const UserList = (props) => {
  const {
    isLoading,
    data,
    query,
    setQuery,
    tokenAdmin,
    canWrite = true,
    onRefetch,
    customerValue,
    setCustomerValue,
    isOpenDrawer,
    setIsOpenDrawer,
    selectedRowKeys,
    setSelectedRowKeys,
  } = props;

  const mutateLock = useMutation({
    mutationFn: ({ id, locked }) => UpdateUserAdminService(id, { locked }, tokenAdmin),
  });

  const openEdit = useCallback(
    (record) => {
      setCustomerValue(record);
      setIsOpenDrawer(true);
    },
    [setCustomerValue, setIsOpenDrawer]
  );

  const closeDrawer = useCallback(() => {
    setIsOpenDrawer(false);
    setCustomerValue(null);
  }, [setCustomerValue, setIsOpenDrawer]);

  const hi = (text) => {
    const t = text == null ? "" : String(text);
    return query.q?.trim() ? (
      <Highlighter
        searchWords={[query.q.trim()]}
        autoEscape
        textToHighlight={t}
        highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
      />
    ) : (
      t || "—"
    );
  };

  const formatJoinedAddress = (record) => {
    const list = record.addresses;
    if (list && list.length) {
      const a = list.find((x) => x.isDefault) || list[0];
      const parts = [a?.address, a?.district, a?.city].filter(Boolean);
      if (parts.length) return parts.join(", ");
    }
    return record.address || "—";
  };

  const columns = [
    {
      title: "Created",
      dataIndex: "createdAt",
      width: 140,
      render: (_) => {
        if (!_) return "—";
        try {
          const d = new Date(_);
          return Number.isNaN(d.getTime())
            ? "—"
            : d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
        } catch {
          return "—";
        }
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      ellipsis: true,
      render: (_, record) => hi(record?.email),
    },
    {
      title: "Full name",
      dataIndex: "fullName",
      ellipsis: true,
      render: (text, record) => hi(text || record?.name || record?.fullName || ""),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      width: 140,
      render: (text, record) => hi(text || record?.phoneNumber || ""),
    },
    {
      title: "Default address",
      dataIndex: "address",
      ellipsis: true,
      render: (_, record) => formatJoinedAddress(record),
    },
    {
      title: "Status",
      dataIndex: "locked",
      width: 90,
      render: (locked) =>
        locked ? (
          <Tag color="error">Locked</Tag>
        ) : (
          <Tag color="success">Active</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 90,
      align: "center",
      render: (_, record) => {
        if (!canWrite) return "—";
        const locked = Boolean(record.locked);
        return (
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            <Tooltip title="Edit customer">
              <Button
                size="small"
                type="primary"
                ghost
                icon={<SettingOutlined />}
                onClick={() => openEdit(record)}
              />
            </Tooltip>
            <Tooltip title={locked ? "Unlock account" : "Lock account"}>
              <Popconfirm
                title={locked ? "Unlock this account?" : "Lock this account?"}
                okText="Yes"
                cancelText="No"
                onConfirm={async () => {
                  const res = await mutateLock.mutateAsync({
                    id: record._id,
                    locked: !locked,
                  });
                  if (res?.success) {
                    toast.success(res.message || (!locked ? "Locked" : "Unlocked"));
                    onRefetch?.();
                  } else {
                    toast.error(res?.message || "Action failed");
                  }
                }}
              >
                <Button
                  size="small"
                  icon={locked ? <UnlockOutlined /> : <LockOutlined />}
                  danger={!locked}
                />
              </Popconfirm>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <Fragment>
      <Table
        rowKey="_id"
        bordered
        rowSelection={
          canWrite
            ? {
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }
            : undefined
        }
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={{
          total: query.totalPage * 10,
          current: query.page,
          position: ["bottomCenter"],
          onChange: (page) => setQuery((prev) => ({ ...prev, page })),
        }}
      />
      {isOpenDrawer && (
        <CustomerDrawer
          customer={customerValue}
          isOpen={isOpenDrawer}
          onClose={closeDrawer}
          refetch={onRefetch}
        />
      )}
    </Fragment>
  );
};

export default UserList;
