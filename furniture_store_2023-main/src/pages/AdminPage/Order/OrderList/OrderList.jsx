/* eslint-disable react/prop-types */
import { InfoOutlined } from "@ant-design/icons";
import { Button, Flex, Table, Tag } from "antd";
import { Fragment, useCallback, useEffect, useState } from "react";
import Highlighter from "react-highlight-words";
import { useNavigate } from "react-router-dom";
import { enumStatus } from "../../../../constants";
import { formatCurrency } from "../../../../utils";

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

const OrderList = (props) => {
  const navigate = useNavigate();
  const { isLoading, data, query, setQuery } = props;
  const [filteredInfo, setFilteredInfo] = useState({});

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

  const columns = [
    {
      title: "Order ID",
      key: "orderNumber",
      width: 160,
      ellipsis: true,
      render: (_, record) =>
        hi(record?.orderNumber || record?._id?.slice(-10) || ""),
    },
    {
      title: "Date placed",
      dataIndex: "createdAt",
      width: 200,
      render: (_, record) => formatDateTime(record?.createdAt),
    },
    {
      title: "Email",
      dataIndex: "email",
      ellipsis: true,
      render: (_, record) => hi(record?.email),
    },
    {
      title: "Recipient",
      dataIndex: "name",
      ellipsis: true,
      render: (_, record) => hi(record?.name),
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      width: 130,
      render: (_, record) => hi(record?.phoneNumber),
    },
    {
      title: "Shipping address",
      dataIndex: "address",
      ellipsis: true,
      render: (_, record) => record?.address || "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      render: (_) => {
        const meta = enumStatus.find((el) => el?.value === _);
        return (
          <Tag color={meta?.color}>
            {meta?.label ?? _ ?? "—"}
          </Tag>
        );
      },
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Confirmed", value: "confirmed" },
        { text: "Shipping", value: "shipping" },
        { text: "Delivered", value: "delivered" },
        { text: "Cancelled", value: "cancelled" },
      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) =>
        String(record?.status ?? "").includes(value),
      defaultFilteredValue: [],
      filterResetToDefaultFilteredValue: true,
      ellipsis: true,
    },
    {
      title: "Total",
      dataIndex: "totalCurrentPrice",
      width: 120,
      align: "right",
      render: (_, record) => formatCurrency(record?.totalCurrentPrice ?? 0),
    },
    {
      title: "Details",
      dataIndex: "action",
      align: "center",
      width: 90,
      render: (_, order) => (
        <Flex align="center" justify="center">
          <Button
            icon={<InfoOutlined />}
            shape="circle"
            type="primary"
            ghost
            onClick={() => {
              navigate(`/admin/order/${order._id}`, { replace: true });
            }}
          />
        </Flex>
      ),
    },
  ];

  const handleChange = useCallback((pagination, filters) => {
    setFilteredInfo(filters);
  }, []);

  useEffect(() => {
    setQuery((prev) => ({
      ...prev,
      status: filteredInfo.status ? filteredInfo.status : [],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync table status filters → API query
  }, [filteredInfo.status]);

  return (
    <Fragment>
      <Table
        rowKey="_id"
        bordered
        scroll={{ x: 1100 }}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        onChange={handleChange}
        pagination={{
          total: query.totalPage * 10,
          current: query.page,
          position: ["bottomCenter"],
          onChange: (page) => {
            setQuery((prev) => ({ ...prev, page }));
          },
        }}
      />
    </Fragment>
  );
};

export default OrderList;
