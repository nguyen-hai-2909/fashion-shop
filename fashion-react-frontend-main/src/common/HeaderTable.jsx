/* eslint-disable react/prop-types */
import { DeleteOutlined, PlusOutlined, RedoOutlined } from "@ant-design/icons";
import { Button, ConfigProvider, Flex, Modal } from "antd";
import { Fragment } from "react";
import Paper from "./Paper";

const deleteLabels = {
  product: {
    title: "Delete products",
    body: "Delete the selected products? This cannot be undone.",
  },
  discount: {
    title: "Delete discount codes",
    body: "Delete the selected discount codes?",
  },
  category: {
    title: "Delete categories",
    body: "Delete the selected categories? This cannot be undone.",
  },
  staff: {
    title: "Delete staff accounts",
    body: "Delete the selected staff accounts? This cannot be undone.",
  },
  default: {
    title: "Confirm delete",
    body: "Delete the selected items?",
  },
};

const HeaderTable = (props) => {
  const {
    isCreate,
    isDelete,
    onRefetch,
    onCreate,
    title,
    selectedRowKeys,
    onDelete,
    isLoadingDelete,
    isOpenModal,
    handleChangeModal,
    deleteEntity,
  } = props;

  const dl = deleteLabels[deleteEntity] || deleteLabels.default;

  return (
    <ConfigProvider
      key={"header-table"}
      theme={{ token: { colorBgContainer: "#fff" } }}
    >
      <Fragment>
        <Paper style={{ marginBottom: 12 }}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
            <h4 style={{ marginBottom: 0, fontWeight: 600 }}>{title}</h4>
            <Flex align="center" justify="flex-end" gap="middle" wrap="wrap">
              {isDelete && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={!selectedRowKeys?.length}
                  onClick={handleChangeModal}
                >
                  Delete
                </Button>
              )}
              {isCreate && (
                <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
                  Add new
                </Button>
              )}
              <Button icon={<RedoOutlined />} onClick={onRefetch}>
                Refresh
              </Button>
            </Flex>
          </Flex>
        </Paper>
        {isOpenModal && (
          <Modal
            title={dl.title}
            open={isOpenModal}
            onOk={onDelete}
            confirmLoading={isLoadingDelete}
            onCancel={handleChangeModal}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <p style={{ marginBottom: 0 }}>{dl.body}</p>
          </Modal>
        )}
      </Fragment>
    </ConfigProvider>
  );
};

export default HeaderTable;
