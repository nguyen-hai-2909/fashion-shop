/* eslint-disable react/prop-types */
import { InfoOutlined } from "@ant-design/icons";
import { Button, Flex, Table, Tag } from "antd";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { enumStatus } from "../../../constants";
import { formatCurrency } from "../../../utils";

const formatOrderDate = (iso) => {
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

const OrderAccountList = (props) => {
  const navigate = useNavigate();
  //! Props
  const { query, setQuery, data, isLoading } = props;
  //! State
  const columns = [
    {
      title: "Created date",
      dataIndex: "createdAt",
      width: 180,
      render: (_) => formatOrderDate(_),
    },
    {
      title: "Email",
      dataIndex: "userEmail",
      render: (_, order) => order?.userEmail || "—",
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (_, order) => order?.shippingAddress?.recipientName || "—",
    },
    {
      title: "Phone number",
      dataIndex: "phoneNumber",
      render: (_, order) => order?.shippingAddress?.phone || "—",
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (_, order) => {
        const shipping = order?.shippingAddress || {};
        const full = [shipping.address, shipping.district, shipping.city]
          .filter(Boolean)
          .join(", ");
        return full || "—";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_) => {
        return (
          <Tag color={enumStatus.find((el) => el?.value === _)?.color}>
            {enumStatus.find((el) => el?.value === _)?.label.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Total order",
      dataIndex: "total",
      render: (_, order) => formatCurrency(order?.total ?? 0),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, order) => {
        return (
          <Flex align={"center"} justify="center">
            <Button
              icon={<InfoOutlined />}
              shape="circle"
              onClick={() => {
                navigate(`/user/order/${order._id}`, { replace: true });
              }}
            />
          </Flex>
        );
      },
    },
  ];
  //! Function

  //! Effect

  //! Render
  return (
    <Fragment>
      <Table
        rowKey={"_id"}
        bordered
        key={"order-list"}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={{
          total: query.totalPage * 10,
          current: query.page,
          position: ["bottomCenter"],
          onChange: (page) => {
            setQuery((prev) => {
              return {
                ...prev,
                page: page,
              };
            });
          },
        }}
      />
    </Fragment>
  );
};

export default OrderAccountList;
