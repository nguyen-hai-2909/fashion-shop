/* eslint-disable react/prop-types */
import { Table, Tag, Popconfirm, Button, Tooltip } from "antd";
import { Fragment, useCallback, useState } from "react";
import Highlighter from "react-highlight-words";
import { useMutation } from "@tanstack/react-query";
import {
  DeleteUserAdminService,
  UpdateUserAdminService,
} from "../../../../services/AdminService";
import { toast } from "react-toastify";
import { DeleteOutlined, LockOutlined, SettingOutlined, UnlockOutlined } from "@ant-design/icons";
import CustomerDrawer from "../CustomerDrawer/CustomerDrawer";

const UserList = (props) => {
  const { isLoading, data, query, setQuery, tokenAdmin, onRefetch } = props;

  const [editTarget, setEditTarget] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mutateLock = useMutation({
    mutationFn: ({ id, locked }) => UpdateUserAdminService(id, { locked }, tokenAdmin),
  });

  const mutateDelete = useMutation({
    mutationFn: (id) => DeleteUserAdminService(id, tokenAdmin),
  });

  const handleDelete = async (record) => {
    const res = await mutateDelete.mutateAsync(record._id);
    if (res?.success) {
      toast.success(res.message || "Account deleted");
      onRefetch?.();
    } else {
      toast.error(res?.message || "Delete failed");
    }
  };

  const openEdit = useCallback((record) => {
    setEditTarget(record);
    setDrawerOpen(true);
  }, []);

  const closeEdit = useCallback(() => {
    setDrawerOpen(false);
    setEditTarget(null);
  }, []);

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
      width: 130,
      render: (_, record) => {
        const locked = Boolean(record.locked);
        return (
          <div style={{ display: "flex", gap: 6 }}>
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
                  const res = await mutateLock.mutateAsync({ id: record._id, locked: !locked });
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

            <Tooltip title="Delete account">
              <Popconfirm
                title="Permanently delete this account?"
                description="This action cannot be undone."
                okText="Delete"
                okButtonProps={{ danger: true }}
                cancelText="Cancel"
                onConfirm={() => handleDelete(record)}
              >
                <Button size="small" icon={<DeleteOutlined />} danger />
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
      {drawerOpen && editTarget && (
        <CustomerDrawer
          customer={editTarget}
          isOpen={drawerOpen}
          onClose={closeEdit}
          refetch={onRefetch}
        />
      )}
    </Fragment>
  );
};

export default UserList;
