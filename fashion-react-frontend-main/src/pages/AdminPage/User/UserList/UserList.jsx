/* eslint-disable react/prop-types */
import { Table } from "antd";
import { Fragment } from "react";
import Highlighter from "react-highlight-words";

const UserList = (props) => {
  const { isLoading, data, query, setQuery } = props;

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
      render: (_) => {
        if (!_) return "—";
        try {
          const d = typeof _ === "string" ? new Date(_) : new Date(_);
          return Number.isNaN(d.getTime())
            ? "—"
            : d.toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              });
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
      render: (text, record) =>
        hi(text || record?.name || record?.fullName || ""),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      width: 140,
      render: (text, record) =>
        hi(text || record?.phoneNumber || ""),
    },
    {
      title: "Default address",
      dataIndex: "address",
      ellipsis: true,
      render: (_, record) => formatJoinedAddress(record),
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
          onChange: (page) => {
            setQuery((prev) => ({ ...prev, page }));
          },
        }}
      />
    </Fragment>
  );
};

export default UserList;
