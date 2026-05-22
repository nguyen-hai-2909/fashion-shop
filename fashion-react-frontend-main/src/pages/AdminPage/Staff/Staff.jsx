import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Flex, Input, Modal, Select, Table, Tag } from "antd";
import { Fragment, useCallback, useContext, useState } from "react";
import HeaderTable from "../../../common/HeaderTable";
import Paper from "../../../common/Paper";
import { adminContext } from "../../../context/AdminContext";
import {
  CreateStaffAdminService,
  DeleteStaffAdminService,
  GetStaffAdminService,
  UpdateStaffAdminService,
} from "../../../services/AdminService";
import { showToast } from "../../../utils/showToast";

const emptyForm = {
  name: "",
  email: "",
  phoneNumber: "",
  role: "staff",
  password: "",
  locked: false,
};

const Staff = () => {
  const { tokenAdmin } = useContext(adminContext);
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-staff", q, tokenAdmin],
    queryFn: () => GetStaffAdminService({ q }, tokenAdmin),
    enabled: Boolean(tokenAdmin),
  });

  const rows = data?.success ? data.data || [] : [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return UpdateStaffAdminService(editing._id, form, tokenAdmin);
      }
      return CreateStaffAdminService(form, tokenAdmin);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => DeleteStaffAdminService(id, tokenAdmin),
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((row) => {
    setEditing(row);
    setForm({
      name: row.name || "",
      email: row.email || "",
      phoneNumber: row.phoneNumber || "",
      role: row.role || "staff",
      password: "",
      locked: !!row.locked,
    });
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const res = await saveMutation.mutateAsync();
      if (!res?.success) throw new Error(res?.message);
      showToast.success(res.message || "Staff saved");
      setModalOpen(false);
      refetch();
    } catch (e) {
      showToast.error(e.message);
    }
  }, [refetch, saveMutation]);

  const handleDelete = useCallback(
    async (id) => {
      try {
        const res = await deleteMutation.mutateAsync(id);
        if (!res?.success) throw new Error(res?.message);
        showToast.success(res.message || "Staff deleted");
        refetch();
      } catch (e) {
        showToast.error(e.message);
      }
    },
    [deleteMutation, refetch]
  );

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phoneNumber", key: "phone" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "manager" ? "blue" : "default"}>
          {role === "manager" ? "Manager" : "Staff"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "locked",
      key: "locked",
      render: (locked) => (
        <Tag color={locked ? "red" : "green"}>{locked ? "Locked" : "Active"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, row) => (
        <Flex gap={8}>
          <Button size="small" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button
            size="small"
            danger
            onClick={() => {
              Modal.confirm({
                title: "Delete staff account?",
                onOk: () => handleDelete(row._id),
              });
            }}
          >
            Delete
          </Button>
        </Flex>
      ),
    },
  ];

  return (
    <Fragment>
      <HeaderTable title="Staff management" onRefetch={refetch} />
      <Paper isFix>
        <Flex justify="space-between" style={{ marginBottom: 12 }} wrap="wrap" gap={8}>
          <Input.Search
            placeholder="Search name, email, phone"
            allowClear
            style={{ maxWidth: 360 }}
            onSearch={(v) => setQ(v ?? "")}
          />
          <Button type="primary" onClick={openCreate}>
            Add staff
          </Button>
        </Flex>
        <Table
          rowKey="_id"
          loading={isLoading}
          columns={columns}
          dataSource={rows}
          pagination={false}
        />
      </Paper>

      <Modal
        title={editing ? "Edit staff" : "Add staff"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saveMutation.isLoading}
        okText="Save"
      >
        <Flex vertical gap={12} style={{ marginTop: 8 }}>
          <Input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            placeholder="Phone"
            value={form.phoneNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, phoneNumber: e.target.value }))
            }
          />
          <Select
            value={form.role}
            onChange={(role) => setForm((f) => ({ ...f, role }))}
            options={[
              { value: "staff", label: "Staff" },
              { value: "manager", label: "Manager" },
            ]}
          />
          <Select
            value={form.locked ? "locked" : "active"}
            onChange={(v) => setForm((f) => ({ ...f, locked: v === "locked" }))}
            options={[
              { value: "active", label: "Active" },
              { value: "locked", label: "Locked" },
            ]}
          />
          <Input.Password
            placeholder={editing ? "New password (optional)" : "Password"}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </Flex>
      </Modal>
    </Fragment>
  );
};

export default Staff;
