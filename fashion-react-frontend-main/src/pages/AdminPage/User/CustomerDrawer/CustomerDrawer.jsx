/* eslint-disable react/prop-types */
import { Fragment, useCallback, useContext, useMemo, useState } from "react";
import { FastField, Form, Formik } from "formik";
import { Button, Drawer, Flex, Input, Modal, Select, Space, Typography } from "antd";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import InputCommon from "../../../../common/Input/InputCommon";
import { adminContext } from "../../../../context/AdminContext";
import {
  CreateCustomerAdminService,
  UpdateUserAdminService,
} from "../../../../services/AdminService";

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const PASSWORD_RULE_MESSAGE =
  "Min 8 chars, upper, lower, number, and special character.";

function buildInitialValues(customer) {
  if (!customer) {
    return {
      email: "",
      fullName: "",
      phone: "",
      password: "",
      locked: false,
    };
  }
  return {
    email: customer.email || "",
    fullName: customer.fullName || customer.name || "",
    phone: customer.phone || customer.phoneNumber || "",
    locked: !!customer.locked,
  };
}

const CustomerDrawer = ({ customer, isOpen, onClose, refetch }) => {
  const { tokenAdmin } = useContext(adminContext);
  const initialValues = useMemo(() => buildInitialValues(customer), [customer]);
  const isEdit = Boolean(customer?._id);

  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const mutateCreate = useMutation({
    mutationFn: (data) => CreateCustomerAdminService(data, tokenAdmin),
  });
  const mutateUpdate = useMutation({
    mutationFn: (data) => UpdateUserAdminService(customer._id, data, tokenAdmin),
  });

  const handleSubmit = useCallback(
    async (values) => {
      try {
        if (isEdit) {
          const res = await mutateUpdate.mutateAsync({
            fullName: values.fullName.trim(),
            phone: values.phone.trim(),
            locked: values.locked,
          });
          if (!res?.success) throw new Error(res?.message || "Failed");
          toast.success(res.message || "Customer updated.");
        } else {
          const res = await mutateCreate.mutateAsync({
            email: values.email.trim(),
            fullName: values.fullName.trim(),
            phone: values.phone.trim(),
            password: values.password?.trim() || "",
            locked: values.locked,
          });
          if (!res?.success) throw new Error(res?.message || "Failed");
          toast.success(res.message || "Customer created.");
        }
        refetch?.();
        onClose?.();
      } catch (e) {
        toast.error(e.message);
      }
    },
    [isEdit, mutateCreate, mutateUpdate, onClose, refetch]
  );

  const handleChangePassword = useCallback(async () => {
    const pw = newPassword.trim();
    if (!STRONG_PASSWORD_REGEX.test(pw)) {
      toast.error(PASSWORD_RULE_MESSAGE);
      return;
    }
    try {
      const res = await mutateUpdate.mutateAsync({ password: pw });
      if (!res?.success) throw new Error(res?.message);
      toast.success(res.message || "Password updated.");
      setPwModalOpen(false);
      setNewPassword("");
    } catch (e) {
      toast.error(e.message);
    }
  }, [mutateUpdate, newPassword]);

  const confirmSave = useCallback(
    (values, dirty) => {
      if (!dirty) return;
      Modal.confirm({
        title: isEdit ? "Save changes?" : "Create customer account?",
        content: isEdit
          ? "Are you sure you want to save these changes?"
          : "Create this customer account?",
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
        fullName: Yup.string().trim(),
        phone: Yup.string().trim(),
        locked: Yup.boolean(),
        ...(isEdit
          ? {}
          : {
              email: Yup.string()
                .required("Email is required")
                .email("Invalid email")
                .trim(),
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
              title={isEdit ? "Edit customer" : "New customer"}
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
                    onClick={() =>
                      confirmSave(helperFormik.values, helperFormik.dirty)
                    }
                    disabled={!helperFormik.dirty}
                    loading={mutateCreate.isLoading || mutateUpdate.isLoading}
                  >
                    Save
                  </Button>
                </Space>
              }
            >
              <Flex vertical gap="middle">
                {isEdit ? (
                  <div>
                    <div style={{ marginBottom: 6, fontWeight: 500 }}>Email</div>
                    <Typography.Text
                      style={{ display: "block", padding: "4px 0", color: "#888" }}
                    >
                      {customer?.email || "—"}
                    </Typography.Text>
                  </div>
                ) : (
                  <FastField
                    component={InputCommon}
                    title="Email"
                    name="email"
                    placeholder="email@example.com"
                  />
                )}
                <FastField
                  component={InputCommon}
                  title="Full name"
                  name="fullName"
                  placeholder="Full name"
                />
                <FastField
                  component={InputCommon}
                  title="Phone"
                  name="phone"
                  placeholder="Phone number"
                />
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
                    <Button onClick={() => setPwModalOpen(true)}>Change Password</Button>
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

export default CustomerDrawer;
