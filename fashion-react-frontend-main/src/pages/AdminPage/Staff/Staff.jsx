import { useMutation, useQuery } from "@tanstack/react-query";
import { Flex, Input } from "antd";
import { Fragment, useCallback, useContext, useState } from "react";
import HeaderTable from "../../../common/HeaderTable";
import Paper from "../../../common/Paper";
import { adminContext } from "../../../context/AdminContext";
import {
  DeleteStaffAdminService,
  GetStaffAdminService,
} from "../../../services/AdminService";
import StaffList from "./StaffList/StaffList";
import { showToast } from "../../../utils/showToast";

const Staff = () => {
  const { tokenAdmin } = useContext(adminContext);
  const [q, setQ] = useState("");
  const [staffValue, setStaffValue] = useState(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-staff", q, tokenAdmin],
    queryFn: () => GetStaffAdminService({ q }, tokenAdmin),
    enabled: Boolean(tokenAdmin),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => DeleteStaffAdminService(id, tokenAdmin),
  });

  const rows = data?.success ? data.data || [] : [];

  const handleDelete = useCallback(async () => {
    try {
      await Promise.all(selectedRowKeys.map((id) => deleteMut.mutateAsync(id)));
      showToast.success(
        selectedRowKeys.length === 1
          ? "Staff deleted"
          : `${selectedRowKeys.length} staff deleted`
      );
      setSelectedRowKeys([]);
      setIsOpenModal(false);
      refetch();
    } catch (e) {
      showToast.error(e.message || "Delete failed");
    }
  }, [selectedRowKeys, deleteMut, refetch]);

  return (
    <Fragment>
      <HeaderTable
        title="Staff management"
        isCreate={true}
        isDelete={true}
        onCreate={() => {
          setStaffValue(null);
          setIsOpenDrawer(true);
        }}
        onRefetch={refetch}
        selectedRowKeys={selectedRowKeys}
        onDelete={handleDelete}
        isLoadingDelete={deleteMut.isLoading}
        isOpenModal={isOpenModal}
        handleChangeModal={() => setIsOpenModal((v) => !v)}
        deleteEntity="staff"
      />
      <Paper isFix={true}>
        <Flex style={{ marginBottom: 12 }}>
          <Input.Search
            placeholder="Search name, email, or phone"
            allowClear
            style={{ maxWidth: 420 }}
            onSearch={(v) => setQ(v ?? "")}
          />
        </Flex>
        <StaffList
          isLoading={isLoading}
          data={rows}
          q={q}
          staffValue={staffValue}
          setStaffValue={setStaffValue}
          isOpenDrawer={isOpenDrawer}
          setIsOpenDrawer={setIsOpenDrawer}
          refetch={refetch}
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
        />
      </Paper>
    </Fragment>
  );
};

export default Staff;
