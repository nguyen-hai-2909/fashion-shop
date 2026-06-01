/* eslint-disable react/prop-types */
import { Fragment, useCallback, useContext, useMemo, useState } from "react";
import { FastField, Form, Formik } from "formik";
import { Button, Drawer, Flex, Input, Modal, Select, Space, Typography } from "antd";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import InputCommon from "../../../../common/Input/InputCommon";
import { adminContext } from "../../../../context/AdminContext";
import {
  CreateStaffAdminService,
  UpdateStaffAdminService,
} from "../../../../services/AdminService";
import { showToast } from "../../../../utils/showToast";

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const PASSWORD_RULE_MESSAGE =
  "Min 8 chars, upper, lower, number, and special character.";

function buildInitialValues(staff) {
  if (!staff) {
    return {
      name: "",
      email: "",
      phoneNumber: "",
      role: "staff",
      password: "",
      locked: false,
    };
  }
  return {
    name: staff.name || "",
    email: staff.email || "",
    phoneNumber: staff.phoneNumber || "",
    role: staff.role || "staff",
    locked: !!staff.locked,
  };
}

const StaffDrawer = ({ staff, isOpen, onClose, refetch }) => {
  const { tokenAdmin } = useContext(adminContext);
  const initialValues = useMemo(() => buildInitialValues(staff), [staff]);
  const isEdit = Boolean(staff?._id);

  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const mutateCreate = useMutation({
    mutationFn: (payload) => CreateStaffAdminService(payload, tokenAdmin),
  });
  const mutateUpdate = useMutation({
    mutationFn: (payload) => UpdateStaffAdminService(staff._id, payload, tokenAdmin),
  });

  const handleSubmit = useCallback(
    async (values) => {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        role: values.role,
        locked: values.locked,
      };
      if (!isEdit) {
        payload.password = values.password?.trim() || "";
        if (!payload.password) {
          showToast.error("Password is required for new staff");
          return;
        }
        if (!STRONG_PASSWORD_REGEX.test(payload.password)) {
          showToast.error(PASSWORD_RULE_MESSAGE);
          return;
        }
      }
      try {
        if (isEdit) {
          const res = await mutateUpdate.mutateAsync(payload);
          if (!res?.success) throw new Error(res?.message);
          showToast.success(res.message || "Updated.");
        } else {
          const res = await mutateCreate.mutateAsync(payload);
          if (!res?.success) throw new Error(res?.message);
          showToast.success(res.message || "Created.");
        }
        refetch?.();
        onClose?.();
      } catch (e) {
        showToast.error(e.message);
      }
    },
    [isEdit, mutateCreate, mutateUpdate, onClose, refetch]
  );

  const handleChangePassword = useCallback(async () => {
    const pw = newPassword.trim();
    if (!STRONG_PASSWORD_REGEX.test(pw)) {
      showToast.error(PASSWORD_RULE_MESSAGE);
      return;
    }
    try {
      const res = await mutateUpdate.mutateAsync({ password: pw });
      if (!res?.success) throw new Error(res?.message);
      showToast.success(res.message || "Password updated.");
      setPwModalOpen(false);
      setNewPassword("");
    } catch (e) {
      showToast.error(e.message);
    }
  }, [mutateUpdate, newPassword]);

  const openPasswordModal = useCallback(() => {
    setNewPassword("");
    setPwModalOpen(true);
  }, []);

  const confirmSave = useCallback(
    (values, dirty) => {
      if (!dirty) return;
      Modal.confirm({
        title: isEdit ? "Save changes?" : "Create staff account?",
        content: isEdit
          ? "Are you sure you want to save these changes?"
          : "Create this staff account?",
        okText: "Save",
        cancelText: "Cancel",
        onOk: () => handleSubmit(values),
      });
    },
    [isEdit, handleSubmit]
  );

  const confirmCancel = useCallback(
    (dirty) => {
      if (!dirty) {
        onClose?.();
        return;
      }
      Modal.confirm({
        title: "Discard changes?",
        content: "You have unsaved changes. Leave without saving?",
        okText: "Discard",
        okButtonProps: { danger: true },
        cancelText: "Keep editing",
        onOk: onClose,
      });
    },
    [onClose]
  );

  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: Yup.string().required("Name is required").trim(),
        email: Yup.string().required("Email is required").email("Invalid email").trim(),
        phoneNumber: Yup.string().trim(),
        role: Yup.string().oneOf(["staff", "manager"]).required(),
        locked: Yup.boolean(),
        ...(isEdit
          ? {}
          : {
              password: Yup.string()
                .required("Password is required")
                .matches(STRONG_PASSWORD_REGEX, PASSWORD_RULE_MESSAGE),
            }),
      }),
    [isEdit]
  );

  return (
    <Fragment>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={false}
        validateOnMount={false}
      >
        {(helperFormik) => (
          <Form>
            <Drawer
              title={isEdit ? "Edit staff" : "New staff"}
              placement="right"
              width={400}
              onClose={() => confirmCancel(helperFormik.dirty)}
              open={isOpen}
              extra={
                <Space size={6}>
                  <Button
                    size="small"
                    onClick={() => confirmCancel(helperFormik.dirty)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => confirmSave(helperFormik.values, helperFormik.dirty)}
                    disabled={!helperFormik.dirty}
                    loading={mutateCreate.isLoading || mutateUpdate.isLoading}
                  >
                    Save
                  </Button>
                </Space>
              }
            >
              <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
                Managers can manage staff accounts and permissions.
              </Typography.Paragraph>
              <Flex vertical gap="middle">
                <FastField
                  component={InputCommon}
                  title="Full name"
                  name="name"
                  placeholder="Full name"
                />
                <FastField
                  component={InputCommon}
                  title="Email"
                  name="email"
                  placeholder="email@example.com"
                  disabled={isEdit}
                />
                <FastField
                  component={InputCommon}
                  title="Phone"
                  name="phoneNumber"
                  placeholder="Phone number"
                />
                <div>
                  <div style={{ marginBottom: 6, fontWeight: 500 }}>Role</div>
                  <Select
                    style={{ width: "100%" }}
                    value={helperFormik.values.role}
                    onChange={(v) => helperFormik.setFieldValue("role", v)}
                    options={[
                      { value: "staff", label: "Staff" },
                      { value: "manager", label: "Manager" },
                    ]}
                  />
                </div>
                <div>
                  <div style={{ marginBottom: 6, fontWeight: 500 }}>Account status</div>
                  <Select
                    style={{ width: "100%" }}
                    value={helperFormik.values.locked ? "locked" : "active"}
                    onChange={(v) =>
                      helperFormik.setFieldValue("locked", v === "locked")
                    }
                    options={[
                      { value: "active", label: "Active" },
                      { value: "locked", label: "Locked" },
                    ]}
                  />
                </div>
                {isEdit ? (
                  <div>
                    <div style={{ marginBottom: 6, fontWeight: 500 }}>Password</div>
                    <Button onClick={openPasswordModal}>Change Password</Button>
                  </div>
                ) : (
                  <FastField
                    component={InputCommon}
                    title="Password"
                    name="password"
                    placeholder="Password"
                    type="password"
                  />
                )}
              </Flex>
            </Drawer>

            <Modal
              title="New password"
              open={pwModalOpen}
              onCancel={() => {
                setPwModalOpen(false);
                setNewPassword("");
              }}
              onOk={handleChangePassword}
              okText="Save password"
              cancelText="Cancel"
              confirmLoading={mutateUpdate.isLoading}
              destroyOnClose
            >
              <Flex vertical gap={12} style={{ marginTop: 8 }}>
                <Typography.Text type="secondary">{PASSWORD_RULE_MESSAGE}</Typography.Text>
                <Input.Password
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onPressEnter={handleChangePassword}
                />
              </Flex>
            </Modal>
          </Form>
        )}
      </Formik>
    </Fragment>
  );
};

export default StaffDrawer;
