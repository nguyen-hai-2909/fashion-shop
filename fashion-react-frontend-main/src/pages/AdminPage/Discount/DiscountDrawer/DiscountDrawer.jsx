/* eslint-disable react/prop-types */
import { Fragment, useCallback, useContext, useMemo } from "react";
import { FastField, Form, Formik } from "formik";
import { Button, Drawer, Flex, Modal, Select, Space, Typography } from "antd";
import InputCommon from "../../../../common/Input/InputCommon";
import { useMutation } from "@tanstack/react-query";
import {
  CreateDiscountService,
  DeleteDiscountService,
  UpdateDiscountService,
} from "../../../../services/DiscountService";
import { adminContext } from "../../../../context/AdminContext";
import * as Yup from "yup";
import { toast } from "react-toastify";

const typeOptions = [
  { value: "percentage", label: "Percentage (e.g. 10%)" },
  { value: "fixed_amount", label: "Fixed amount (VND)" },
];

function buildInitialValues(discount) {
  if (!discount) {
    return { discountCode: "", type: "percentage", valueNum: "", usageLimit: "" };
  }
  const vd = discount.valueDiscount != null ? String(discount.valueDiscount) : "";
  const fromType = discount.type === "fixed_amount" ? "fixed_amount" : "percentage";
  const type = vd.includes("%") ? "percentage" : fromType;
  let valueNum = discount.value;
  if (valueNum == null || valueNum === "") {
    const parsed = parseFloat(vd.replace("%", "").replace(/,/g, "").trim());
    valueNum = Number.isFinite(parsed) ? parsed : "";
  }
  const lim = discount.usage_limit;
  return {
    discountCode: discount.idDiscount || discount.code || "",
    type,
    valueNum: valueNum === "" ? "" : valueNum,
    usageLimit: lim != null && lim !== "" ? lim : "",
  };
}

const DiscountDrawer = (props) => {
  const { tokenAdmin } = useContext(adminContext);
  const { discount, onClose, isOpen, refetch } = props;

  const initialValues = useMemo(() => buildInitialValues(discount), [discount]);

  const mutateCreate = useMutation({
    mutationFn: (data) => CreateDiscountService(data, tokenAdmin),
  });
  const mutateUpdate = useMutation({
    mutationFn: (data) => UpdateDiscountService(discount?._id, data, tokenAdmin),
  });
  const mutateDelete = useMutation({
    mutationFn: (id) => DeleteDiscountService(id, tokenAdmin),
  });

  const handleSubmit = useCallback(
    async (values) => {
      const code = values.discountCode.trim();
      const v = Number(values.valueNum);
      if (!code || !Number.isFinite(v) || v <= 0) {
        toast.error("Enter a valid code and value.");
        return;
      }
      const payload = {
        idDiscount: code,
        code,
        type: values.type,
        value: v,
        valueDiscount: values.type === "percentage" ? `${v}%` : String(v),
        usage_limit:
          values.usageLimit === "" || values.usageLimit == null
            ? null
            : Math.max(0, Number(values.usageLimit)),
      };
      try {
        if (discount) {
          const response = await mutateUpdate.mutateAsync(payload);
          if (!response.success) throw new Error(response.message);
          toast.success(response.message || "Updated.");
        } else {
          const response = await mutateCreate.mutateAsync({
            ...payload,
            amountUse: payload.usage_limit,
          });
          if (!response.success) throw new Error(response.message);
          toast.success(response.message || "Created.");
        }
        refetch?.();
        onClose?.();
      } catch (error) {
        toast.error(error.message);
      }
    },
    [discount, mutateCreate, mutateUpdate, onClose, refetch]
  );

  const handleDelete = useCallback(async () => {
    if (!discount?._id) return;
    try {
      const res = await mutateDelete.mutateAsync(discount._id);
      if (!res?.success) throw new Error(res?.message || "Failed");
      toast.success(res.message || "Deleted.");
      refetch?.();
      onClose?.();
    } catch (e) {
      toast.error(e.message);
    }
  }, [discount?._id, mutateDelete, onClose, refetch]);

  const confirmSave = useCallback(
    (values, dirty) => {
      if (!dirty) return;
      Modal.confirm({
        title: discount ? "Save changes?" : "Create discount?",
        content: discount
          ? "Are you sure you want to save these changes?"
          : "Create this discount code?",
        okText: "Save",
        cancelText: "Cancel",
        onOk: () => handleSubmit(values),
      });
    },
    [discount, handleSubmit]
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

  const confirmDelete = useCallback(() => {
    Modal.confirm({
      title: "Delete discount?",
      content: `Delete code "${discount?.idDiscount || discount?.code}"? This cannot be undone.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: handleDelete,
    });
  }, [discount, handleDelete]);

  return (
    <Fragment>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={Yup.object({
          discountCode: Yup.string().required("Required").trim(),
          type: Yup.string().required(),
          valueNum: Yup.number()
            .typeError("Enter a number")
            .positive("Must be > 0")
            .required("Required"),
          usageLimit: Yup.mixed(),
        })}
        validateOnBlur={false}
        validateOnChange={false}
        validateOnMount={false}
      >
        {(helperFormik) => (
          <Form>
            <Drawer
              title={discount ? "Edit discount" : "New discount"}
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
              <Flex vertical gap="middle">
                <FastField
                  component={InputCommon}
                  title="Code"
                  name="discountCode"
                  placeholder="e.g. SUMMER2026"
                  disabled={!!discount}
                />
                <div>
                  <div style={{ marginBottom: 6, fontWeight: 500 }}>
                    Discount type
                  </div>
                  <Select
                    style={{ width: "100%" }}
                    options={typeOptions}
                    value={helperFormik.values.type}
                    onChange={(v) => helperFormik.setFieldValue("type", v)}
                  />
                </div>
                <FastField
                  component={InputCommon}
                  title={
                    helperFormik.values.type === "percentage"
                      ? "Percent off"
                      : "Amount off (VND)"
                  }
                  name="valueNum"
                  placeholder={
                    helperFormik.values.type === "percentage" ? "10" : "50000"
                  }
                  type="number"
                />
                <FastField
                  component={InputCommon}
                  title="Usage limit"
                  name="usageLimit"
                  placeholder="Empty = unlimited"
                  type="number"
                />
              </Flex>
            </Drawer>
          </Form>
        )}
      </Formik>
    </Fragment>
  );
};

export default DiscountDrawer;
