/* eslint-disable react/prop-types */
import { LockOutlined, SettingOutlined, UnlockOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Table, Tag, Tooltip } from "antd";
import { Fragment, useCallback, useContext } from "react";
import Highlighter from "react-highlight-words";
import { useMutation } from "@tanstack/react-query";
import StaffDrawer from "../StaffDrawer/StaffDrawer";
import { UpdateStaffAdminService } from "../../../../services/AdminService";
import { adminContext } from "../../../../context/AdminContext";
import { showToast } from "../../../../utils/showToast";

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
  canWrite = true,
}) => {
  const { tokenAdmin } = useContext(adminContext);

  const lockMut = useMutation({
    mutationFn: ({ id, locked }) =>
      UpdateStaffAdminService(id, { locked }, tokenAdmin),
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
      render: (_, item) => {
        if (!canWrite) return "—";
        const locked = Boolean(item.locked);
        return (
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            <Tooltip title="Edit staff">
              <Button
                type="primary"
                ghost
                size="small"
                icon={<SettingOutlined />}
                onClick={() => {
                  setStaffValue(item);
                  setIsOpenDrawer(true);
                }}
              />
            </Tooltip>
            <Tooltip title={locked ? "Unlock account" : "Lock account"}>
              <Popconfirm
                title={locked ? "Unlock this account?" : "Lock this account?"}
                okText="Yes"
                cancelText="No"
                onConfirm={async () => {
                  const res = await lockMut.mutateAsync({
                    id: item._id,
                    locked: !locked,
                  });
                  if (res?.success) {
                    showToast.success(res.message || (!locked ? "Locked" : "Unlocked"));
                    refetch?.();
                  } else {
                    showToast.error(res?.message || "Action failed");
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
