/* eslint-disable react/prop-types */
import { ConfigProvider, Modal, Select } from "antd";
import { useCallback, useContext, useEffect, useState } from "react";
import { enumStatusAdmin } from "../../../../constants";
import { adminContext } from "../../../../context/AdminContext";
import { useMutation } from "@tanstack/react-query";
import { UpdateStatusAdminService } from "../../../../services/AdminService";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ModalChangeStatus = (props) => {
  const { tokenAdmin } = useContext(adminContext);
  const { id } = useParams();
  //! Props
  const { isActive, changeActive, refetch, status } = props;
  //! State
  const [valueSelected, setValueSelected] = useState(status);
  useEffect(() => {
    if (isActive) setValueSelected(status);
  }, [isActive, status]);
  const mutateUpdate = useMutation({
    mutationFn: (data) => UpdateStatusAdminService(id, data, tokenAdmin),
  });
  //! Function
  const handleOk = useCallback(async () => {
    try {
      const response = await mutateUpdate.mutateAsync({
        status: valueSelected,
      });
      const { success, message } = response;
      if (!success) {
        throw new Error(message);
      }
      toast.success(message);
      refetch && refetch();
      changeActive && changeActive();
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }, [valueSelected, isActive]);
  const handleChange = useCallback((value) => setValueSelected(value), []);
  //! Effect

  //! Render
  return (
    <ConfigProvider
      key={"modal"}
      theme={{ token: { colorBgContainer: "#fff" } }}
    >
      <Modal
        title="Update order status"
        open={isActive}
        onOk={handleOk}
        confirmLoading={mutateUpdate.isLoading}
        onCancel={changeActive}
      >
        <Select
          style={{ width: "50%" }}
          options={enumStatusAdmin(valueSelected)}
          value={valueSelected}
          onChange={handleChange}
          title="Status order"
        />
      </Modal>
    </ConfigProvider>
  );
};

export default ModalChangeStatus;
