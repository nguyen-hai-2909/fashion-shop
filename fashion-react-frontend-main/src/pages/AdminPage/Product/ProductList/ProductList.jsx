/* eslint-disable react/prop-types */
import { Button, Flex, Image, Input, Space, Switch, Table } from "antd";
import { Fragment, useEffect, useRef, useState } from "react";
import { SearchOutlined, SettingOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { formatCurrency } from "../../../../utils";
import { ToggleProductStorefrontService } from "../../../../services/ProductService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { categoryList, companyList, labelForCategory } from "../../../../constants";

const ProductList = (props) => {
  const navigate = useNavigate();
  //! Props
  const {
    query,
    isLoading,
    data,
    setQuery,
    selectedRowKeys,
    setSelectedRowKeys,
    tokenAdmin,
    onToggleVisibility,
  } = props;
  //! State
  const [toggleBusyId, setToggleBusyId] = useState(null);
  const [searchedColumn, setSearchedColumn] = useState("");
  const [filteredInfo, setFilteredInfo] = useState({});
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    setQuery((prev) => {
      return {
        ...prev,
        page: 1,
        [dataIndex]: selectedKeys[0],
      };
    });
    confirm();
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters, confirm, close, dataIndex) => {
    clearFilters();
    setQuery((prev) => {
      return {
        ...prev,
        [dataIndex]: "",
        page: 1,
      };
    });
    confirm();
    close();
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() =>
              clearFilters &&
              handleReset(clearFilters, confirm, close, dataIndex)
            }
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      String(record?.[dataIndex] ?? "")
        .toLowerCase()
        .includes(String(value ?? "").toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[query.name]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  const brandFilters = companyList.map((c) => ({ text: c.label, value: c.value }));
  const categoryFilters = categoryList.map((c) => ({ text: c.label, value: c.value }));

  const columns = [
    {
      title: "Image",
      dataIndex: "images",
      width: 120,
      render: (img) => {
        const url = img?.[0]?.url;
        return url ? (
          <Image width={88} height={88} src={url} style={{ objectFit: "cover", borderRadius: 8 }} />
        ) : (
          <span style={{ color: "#bfbfbf" }}>—</span>
        );
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Brand",
      dataIndex: "company",
      filters: brandFilters,
      filteredValue: filteredInfo.company || null,
      onFilter: (value, record) =>
        (record.company || record.brand || "").toString() === value,
      defaultFilteredValue: [],
      filterResetToDefaultFilteredValue: true,
      ellipsis: true,
    },
    {
      title: "Category",
      dataIndex: "category",
      filters: categoryFilters,
      filteredValue: filteredInfo.category || null,
      onFilter: (value, record) => (record.category || "").toString() === value,
      defaultFilteredValue: [],
      filterResetToDefaultFilteredValue: true,
      ellipsis: true,
      render: (slug) => labelForCategory(slug),
    },
    {
      title: "From price",
      dataIndex: "price",
      render: (_) => {
        return <>{formatCurrency(_)}</>;
      },
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      align: "center",
      render: (_, row) => (
        <Switch
          checked={String(row?.status || "").toLowerCase() === "active"}
          loading={toggleBusyId === row._id}
          onChange={async () => {
            if (!tokenAdmin) return;
            setToggleBusyId(row._id);
            try {
              const res = await ToggleProductStorefrontService(
                row._id,
                tokenAdmin
              );
              if (!res?.success) {
                throw new Error(res?.message || "Could not update visibility");
              }
              toast.success(res.message || "Updated");
              onToggleVisibility?.();
            } catch (e) {
              toast.error(e.message);
            } finally {
              setToggleBusyId(null);
            }
          }}
        />
      ),
    },
    {
      title: "Actions",
      dataIndex: "_id",
      align: "center",
      width: 100,
      render: (id) => {
        return (
          <Flex align="center" justify="center">
            <Button
              type="primary"
              ghost
              icon={<SettingOutlined />}
              onClick={() => {
                navigate(`/admin/product/${id}`, { replace: true });
              }}
            />
          </Flex>
        );
      },
    },
  ];
  //! Function
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const handleChange = (pagination, filters) => {
    setFilteredInfo(filters);
  };
  //! Effect
  useEffect(() => {
    setQuery((prev) => {
      return {
        ...prev,
        company: filteredInfo.company ? filteredInfo.company : [],
        category: filteredInfo.category ? filteredInfo.category : [],
      };
    });
  }, [filteredInfo.company, filteredInfo.category]);
  //! Render
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  return (
    <Fragment>
      <Table
        rowKey={"_id"}
        bordered
        key={"product-list"}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        onChange={handleChange}
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

export default ProductList;
