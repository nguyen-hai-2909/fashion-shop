import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Input, Popconfirm, Rate, Select, Space, Table } from "antd";
import { Fragment, useContext, useMemo, useState } from "react";
import HeaderTable from "../../../common/HeaderTable";
import Paper from "../../../common/Paper";
import { adminContext } from "../../../context/AdminContext";
import { canWriteAdminData } from "../../../utils/adminPermission";
import {
  DeleteReviewAdminService,
  GetReviewsAdminService,
} from "../../../services/AdminService";
import { toast } from "react-toastify";

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

  const columns = [
    { title: "Customer", dataIndex: "userEmail", width: 220 },
    { title: "Product", dataIndex: "productName", width: 220 },
    { title: "Variant", dataIndex: "variantTitle", width: 180 },
    { title: "Rating", dataIndex: "rating", width: 120, render: (_) => <Rate disabled value={_} /> },
    { title: "Comment", dataIndex: "comment" },
    {
      title: "Date",
      dataIndex: "reviewedAt",
      width: 180,
      render: (_) => formatDateTime(_),
    },
    ...(canWrite
      ? [
          {
            title: "Action",
            width: 120,
            render: (_, row) => (
              <Popconfirm
                title="Remove this review?"
                description="Clears rating and comment for this line item (same as legacy admin)."
                okText="Remove"
                cancelText="Cancel"
                onConfirm={async () => {
                  const res = await delMut.mutateAsync({
                    orderId: row.orderId,
                    itemIndex: row.itemIndex,
                  });
                  if (res?.success) {
                    toast.success(res.message);
                    refetch();
                  } else {
                    toast.error(res?.message || "Could not delete review");
                  }
                }}
              >
                <Button danger loading={delMut.isLoading}>
                  Delete
                </Button>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  return (
    <Fragment>
      <HeaderTable title="Reviews" onRefetch={refetch} />
      <Paper isFix={true}>
        <Space style={{ marginBottom: 12 }}>
          <Input
            placeholder="Search by customer email, product, variant, comment"
            value={q}
            onChange={(e) => setQ(e.target.value)}
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
        <Table rowKey="id" dataSource={rows} columns={columns} loading={isFetching} />
      </Paper>
    </Fragment>
  );
};

export default Review;
