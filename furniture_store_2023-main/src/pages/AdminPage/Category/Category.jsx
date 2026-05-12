import { useMutation, useQuery } from "@tanstack/react-query";
import { DeleteOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Modal, Space, Switch, Table } from "antd";
import { Fragment, useContext, useMemo, useState } from "react";
import HeaderTable from "../../../common/HeaderTable";
import Paper from "../../../common/Paper";
import { adminContext } from "../../../context/AdminContext";
import {
  CreateCategoryService,
  DeleteCategoryService,
  GetCategoriesService,
  ToggleCategoryService,
  UpdateCategoryService,
} from "../../../services/CategoryService";
import { toast } from "react-toastify";

const Category = () => {
  const { tokenAdmin } = useContext(adminContext);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    isActive: true,
  });

  const { data, isFetching, refetch } = useQuery(
    ["categories-admin"],
    () => GetCategoriesService({ all: true }),
    {
      onSuccess: () => {},
    }
  );

  const createMut = useMutation({
    mutationFn: (payload) => CreateCategoryService(payload, tokenAdmin),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => UpdateCategoryService(id, payload, tokenAdmin),
  });
  const toggleMut = useMutation({
    mutationFn: (id) => ToggleCategoryService(id, tokenAdmin),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => DeleteCategoryService(id, tokenAdmin),
  });

  const rows = useMemo(() => {
    const list = data?.data || [];
    const key = q.trim().toLowerCase();
    if (!key) return list;
    return list.filter(
      (c) =>
        String(c?.name || "")
          .toLowerCase()
          .includes(key) ||
        String(c?.slug || "")
          .toLowerCase()
          .includes(key)
    );
  }, [data?.data, q]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", isActive: true });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row?.name || "",
      slug: row?.slug || "",
      isActive: row?.isActive !== false,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!form.name.trim()) {
        toast.error("Category name is required");
        return;
      }
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        /** Backend uses sortOrder for menu ordering; keep existing on edit, 0 for new. */
        sortOrder: editing
          ? Number(editing.sortOrder ?? 0)
          : 0,
        isActive: !!form.isActive,
      };
      const res = editing?._id
        ? await updateMut.mutateAsync({ id: editing._id, payload })
        : await createMut.mutateAsync(payload);
      if (!res?.success) throw new Error(res?.message || "Failed");
      toast.success(res.message);
      setOpen(false);
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Slug", dataIndex: "slug" },
    {
      title: "Status",
      dataIndex: "isActive",
      width: 140,
      render: (_, row) => (
        <Switch
          checked={row?.isActive !== false}
          onChange={async () => {
            const res = await toggleMut.mutateAsync(row._id);
            if (res?.success) refetch();
          }}
        />
      ),
    },
    {
      title: "Actions",
      width: 120,
      align: "center",
      render: (_, row) => (
        <Flex justify="center" gap="small">
          <Button
            type="primary"
            ghost
            icon={<SettingOutlined />}
            onClick={() => openEdit(row)}
            title="Edit category"
          />
          <Button
            danger
            type="primary"
            ghost
            icon={<DeleteOutlined />}
            title="Delete category"
            onClick={async () => {
              const res = await deleteMut.mutateAsync(row._id);
              if (res?.success) {
                toast.success(res.message);
                refetch();
              }
            }}
          />
        </Flex>
      ),
    },
  ];

  return (
    <Fragment>
      <HeaderTable title="Categories" isCreate={true} onCreate={openCreate} />
      <Paper isFix={true}>
        <Flex justify="space-between" style={{ marginBottom: 12 }}>
          <Input
            placeholder="Search by name or slug"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ maxWidth: 360 }}
          />
        </Flex>
        <Table
          rowKey="_id"
          loading={isFetching}
          columns={columns}
          dataSource={rows}
          pagination={false}
        />
      </Paper>
      <Modal
        title={editing ? "Edit category" : "New category"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createMut.isLoading || updateMut.isLoading}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            placeholder="Slug (optional)"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
          />
          <Flex align="center" gap={8}>
            <span>Active</span>
            <Switch
              checked={form.isActive}
              onChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
            />
          </Flex>
        </Space>
      </Modal>
    </Fragment>
  );
};

export default Category;
