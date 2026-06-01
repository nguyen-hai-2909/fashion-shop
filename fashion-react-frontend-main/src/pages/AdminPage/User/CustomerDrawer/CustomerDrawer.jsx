/* eslint-disable react/prop-types */
import { Fragment, useCallback, useContext, useMemo } from "react";
import { FastField, Form, Formik } from "formik";
import { Button, Drawer, Flex, Modal, Select, Space, Typography } from "antd";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import InputCommon from "../../../../common/Input/InputCommon";
import { adminContext } from "../../../../context/AdminContext";
import { UpdateUserAdminService } from "../../../../services/AdminService";

function buildInitialValues(customer) {
  if (!customer) return { fullName: "", phone: "", locked: false };
  return {
    fullName: customer.fullName || customer.name || "",
    phone: customer.phone || customer.phoneNumber || "",
    locked: !!customer.locked,
  };
}

const CustomerDrawer = ({ customer, isOpen, onClose, refetch }) => {
  const { tokenAdmin } = useContext(adminContext);
  const initialValues = useMemo(() => buildInitialValues(customer), [customer]);

  const mutateUpdate = useMutation({
    mutationFn: (data) => UpdateUserAdminService(customer._id, data, tokenAdmin),
  });

  const handleSubmit = useCallback(
    async (values) => {
      try {
        const res = await mutateUpdate.mutateAsync({
          fullName: values.fullName.trim(),
          phone: values.phone.trim(),
          locked: values.locked,
        });
        if (!res?.success) throw new Error(res?.message || "Failed");
        toast.success(res.message || "Customer updated.");
        refetch?.();
        onClose?.();
      } catch (e) {
        toast.error(e.message);
      }
    },
    [mutateUpdate, onClose, refetch]
  );

  const confirmSave = useCallback(
    (values, dirty) => {
      if (!dirty) return;
      Modal.confirm({
        title: "Save changes?",
        content: "Are you sure you want to save these changes?",
        okText: "Save",
        cancelText: "Cancel",
        onOk: () => handleSubmit(values),
      });
    },
    [handleSubmit]
  );

  const confirmCancel = useCallback(
    (dirty) => {
      if (!dirty) { onClose?.(); return; }
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

  return (
    <Fragment>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={Yup.object({
          fullName: Yup.string().trim(),
          phone: Yup.string().trim(),
          locked: Yup.boolean(),
        })}
        validateOnBlur={false}
        validateOnChange={false}
        validateOnMount={false}
      >
        {(helperFormik) => (
          <Form>
            <Drawer
              title="Edit customer"
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
                    loading={mutateUpdate.isLoading}
                  >
                    Save
                  </Button>
                </Space>
              }
            >
              <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
                Email cannot be changed. To delete this account, use the delete button on the table.
              </Typography.Paragraph>
              <Flex vertical gap="middle">
                <div>
                  <div style={{ marginBottom: 6, fontWeight: 500 }}>Email</div>
                  <Typography.Text style={{ display: "block", padding: "4px 0", color: "#888" }}>
                    {customer?.email || "—"}
                  </Typography.Text>
                </div>
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
              </Flex>
            </Drawer>
          </Form>
        )}
      </Formik>
    </Fragment>
  );
};

export default CustomerDrawer;
