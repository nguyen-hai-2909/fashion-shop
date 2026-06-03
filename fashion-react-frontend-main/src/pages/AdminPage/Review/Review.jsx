import { useMutation, useQuery } from "@tanstack/react-query";
import { Input, Rate, Select, Space, Table } from "antd";
import { Fragment, useCallback, useContext, useMemo, useState } from "react";
import HeaderTable from "../../../common/HeaderTable";
import Paper from "../../../common/Paper";
import { adminContext } from "../../../context/AdminContext";
import { canWriteAdminData } from "../../../utils/adminPermission";
import {
  DeleteReviewAdminService,
  GetReviewsAdminService,
} from "../../../services/AdminService";
import { toast } from "react-toastify";
import { formatVariantTitle } from "../../../utils";

const formatDateTime = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
};

const Review = () => {
  const { admin, tokenAdmin } = useContext(adminContext);
  const canWrite = canWriteAdminData(admin?.role);
  const [q, setQ] = useState("");
  const [rating, setRating] = useState(undefined);
  const [sortDir, setSortDir] = useState("desc");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["admin-reviews", q, rating, sortDir, tokenAdmin],
    queryFn: () =>
      GetReviewsAdminService({ q, rating, sortDir }, tokenAdmin),
    enabled: Boolean(tokenAdmin),
  });

  const delMut = useMutation({
    mutationFn: ({ orderId, itemIndex }) =>
      DeleteReviewAdminService(orderId, itemIndex, tokenAdmin),
  });

  const rows = useMemo(() => data?.data || [], [data?.data]);

  const handleDelete = useCallback(async () => {
    const selected = rows.filter((r) => selectedRowKeys.includes(r.id));
    try {
      await Promise.all(
        selected.map((row) =>
          delMut.mutateAsync({
            orderId: row.orderId,
            itemIndex: row.itemIndex,
          })
        )
      );
      toast.success(
        selected.length === 1
          ? "Review deleted"
          : `${selected.length} reviews deleted`
      );
      setSelectedRowKeys([]);
      setIsOpenModal(false);
      refetch();
    } catch (e) {
      toast.error(e?.message || "Could not delete review");
    }
  }, [rows, selectedRowKeys, delMut, refetch]);

  const columns = [
    { title: "Customer", dataIndex: "userEmail", width: 220 },
    { title: "Product", dataIndex: "productName", width: 220 },
    {
      title: "Variant",
      dataIndex: "variantTitle",
      width: 180,
      render: (v) => formatVariantTitle(v),
    },
    { title: "Rating", dataIndex: "rating", width: 120, render: (_) => <Rate disabled value={_} /> },
    { title: "Comment", dataIndex: "comment" },
    {
      title: "Date",
      dataIndex: "reviewedAt",
      width: 180,
      render: (_) => formatDateTime(_),
    },
  ];

  return (
    <Fragment>
      <HeaderTable
        title="Reviews"
        deleteEntity="review"
        isDelete={canWrite}
        selectedRowKeys={selectedRowKeys}
        onRefetch={refetch}
        onDelete={handleDelete}
        isLoadingDelete={delMut.isLoading}
        isOpenModal={isOpenModal}
        handleChangeModal={() => setIsOpenModal((v) => !v)}
      />
      <Paper isFix={true}>
        <Space style={{ marginBottom: 12 }} wrap>
          <Input.Search
            placeholder="Search by customer email, product, variant, comment"
            allowClear
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={(v) => setQ(v ?? "")}
            style={{ width: 380 }}
          />
          <Select
            allowClear
            placeholder="Rating"
            style={{ width: 120 }}
            value={rating}
            onChange={setRating}
            options={[5, 4, 3, 2, 1].map((n) => ({
              value: n,
              label: `${n} stars`,
            }))}
          />
          <Select
            style={{ width: 160 }}
            value={sortDir}
            onChange={setSortDir}
            options={[
              { value: "desc", label: "Newest" },
              { value: "asc", label: "Oldest" },
            ]}
          />
        </Space>
        <Table
          rowKey="id"
          dataSource={rows}
          columns={columns}
          loading={isFetching}
          rowSelection={
            canWrite
              ? {
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                }
              : undefined
          }
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            position: ["bottomCenter"],
          }}
        />
      </Paper>
    </Fragment>
  );
};

export default Review;
