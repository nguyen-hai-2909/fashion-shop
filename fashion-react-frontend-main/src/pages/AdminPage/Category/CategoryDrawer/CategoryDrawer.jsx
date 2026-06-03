/* eslint-disable react/prop-types */
import { Fragment, useCallback, useContext, useMemo } from "react";
import { FastField, Form, Formik } from "formik";
import { Button, Drawer, Flex, Modal, Space, Switch, Typography } from "antd";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import InputCommon from "../../../../common/Input/InputCommon";
import { adminContext } from "../../../../context/AdminContext";
import {
  CreateCategoryService,
  UpdateCategoryService,
} from "../../../../services/CategoryService";

function buildInitialValues(category) {
  if (!category) return { name: "", slug: "", isActive: true };
  return {
    name: category.name || "",
    slug: category.slug || "",
    isActive: category.isActive !== false,
  };
}

const CategoryDrawer = ({ category, isOpen, onClose, refetch }) => {
  const { tokenAdmin } = useContext(adminContext);
  const initialValues = useMemo(() => buildInitialValues(category), [category]);

  const mutateCreate = useMutation({
    mutationFn: (payload) => CreateCategoryService(payload, tokenAdmin),
  });
  const mutateUpdate = useMutation({
    mutationFn: ({ id, payload }) => UpdateCategoryService(id, payload, tokenAdmin),
  });

  const handleSubmit = useCallback(
    async (values) => {
      const name = values.name.trim();
      if (!name) {
        toast.error("Category name is required");
        return;
      }
      const payload = {
        name,
        slug: values.slug.trim(),
        sortOrder: category ? Number(category.sortOrder ?? 0) : 0,
        isActive: !!values.isActive,
      };
      try {
        if (category?._id) {
          const res = await mutateUpdate.mutateAsync({ id: category._id, payload });
          if (!res?.success) throw new Error(res?.message || "Failed");
          toast.success(res.message || "Updated.");
        } else {
          const res = await mutateCreate.mutateAsync(payload);
          if (!res?.success) throw new Error(res?.message || "Failed");
          toast.success(res.message || "Created.");
        }
        refetch?.();
        onClose?.();
      } catch (e) {
        toast.error(e.message);
      }
    },
    [category, mutateCreate, mutateUpdate, onClose, refetch]
  );

  const confirmSave = useCallback(
    (values, dirty) => {
      if (!dirty) return;
      Modal.confirm({
        title: category ? "Save changes?" : "Create category?",
        content: category
          ? "Are you sure you want to save these changes?"
          : "Create this category?",
        okText: "Save",
        cancelText: "Cancel",
        onOk: () => handleSubmit(values),
      });
    },
    [category, handleSubmit]
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

  return (
    <Fragment>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={Yup.object({
          name: Yup.string().required("Name is required").trim(),
          slug: Yup.string().trim(),
          isActive: Yup.boolean(),
        })}
        validateOnBlur={false}
        validateOnChange={false}
        validateOnMount={false}
      >
        {(helperFormik) => (
          <Form>
            <Drawer
              title={category ? "Edit category" : "New category"}
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
                  title="Name"
                  name="name"
                  placeholder="e.g. Men's tops"
                />
                <FastField
                  component={InputCommon}
                  title="Slug"
                  name="slug"
                  placeholder="e.g. ao-nam"
                  disabled={!!category}
                />
                <Flex align="center" gap={8}>
                  <span style={{ fontWeight: 500 }}>Active on storefront</span>
                  <Switch
                    checked={helperFormik.values.isActive}
                    onChange={(v) => helperFormik.setFieldValue("isActive", v)}
                  />
                </Flex>
              </Flex>
            </Drawer>
          </Form>
        )}
      </Formik>
    </Fragment>
  );
};

export default CategoryDrawer;
