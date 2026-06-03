/* eslint-disable react/prop-types */
import { SettingOutlined } from "@ant-design/icons";
import { Button, Table, Tag } from "antd";
import { Fragment, useCallback } from "react";
import Highlighter from "react-highlight-words";
import DiscountDrawer from "../DiscountDrawer/DiscountDrawer";
import { formatCurrency } from "../../../../utils";

const DiscountList = (props) => {
  const {
    query,
    isLoading,
    data,
    setQuery,
    selectedRowKeys,
    setSelectedRowKeys,
    discountValue,
    setDiscountValue,
    setIsOpenDrawer,
    isOpenDrawer,
    refetch,
    canWrite = true,
  } = props;

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
      title: "Code",
      dataIndex: "idDiscount",
      ellipsis: true,
      render: (text) => hi(text),
    },
    {
      title: "Type",
      dataIndex: "type",
      width: 120,
      render: (t) => {
        if (t === "fixed_amount") return <Tag>Fixed</Tag>;
        if (t === "percentage") return <Tag color="purple">Percent</Tag>;
        return t || "—";
      },
    },
    {
      title: "Value",
      dataIndex: "valueDiscount",
      render: (_) => {
        const display = String(_ || "").includes("%")
          ? String(_)
          : formatCurrency(_);
        return query.q?.trim() ? (
          <Highlighter
            searchWords={[query.q.trim()]}
            autoEscape
            textToHighlight={display}
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          />
        ) : (
          display
        );
      },
    },
    {
      title: "Used / limit",
      key: "usage",
      align: "center",
      render: (_, row) => {
        const used = row.usage_count ?? 0;
        const lim = row.usage_limit;
        if (lim == null) return `${used} / ∞`;
        return `${used} / ${lim}`;
      },
    },
    {
      title: "Status",
      dataIndex: "is_active",
      width: 110,
      render: (v) =>
        v === false ? <Tag color="red">Off</Tag> : <Tag color="green">On</Tag>,
    },
    {
      title: "Actions",
      dataIndex: "_id",
      align: "center",
      width: 100,
      render: (_, item) =>
        canWrite ? (
          <Button
            type="primary"
            ghost
            icon={<SettingOutlined />}
            onClick={() => {
              setIsOpenDrawer(true);
              setDiscountValue(item);
            }}
          />
        ) : (
          "—"
        ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleCloseDrawer = useCallback(() => {
    setIsOpenDrawer((active) => !active);
    setDiscountValue(null);
  }, [setDiscountValue, setIsOpenDrawer]);

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <Fragment>
      <Table
        rowKey="_id"
        bordered
        rowSelection={rowSelection}
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
      {isOpenDrawer && (
        <DiscountDrawer
          discount={discountValue}
          onClose={handleCloseDrawer}
          isOpen={isOpenDrawer}
          refetch={refetch}
        />
      )}
    </Fragment>
  );
};

export default DiscountList;
