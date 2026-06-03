import {
  CloseOutlined,
  PlusOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Flex, Modal, Row, Typography } from "antd";
import { Formik, Form, FastField, ErrorMessage } from "formik";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import InputCommon from "../../../../common/Input/InputCommon";
import Paper from "../../../../common/Paper";
import SelectCommon from "../../../../common/Select/SelectCommon";
import {
  categoryList,
  colorsList,
  companyList,
  labelForCategory,
  productStatusFormOptions,
} from "../../../../constants";
import UploadImages from "./UploadImages";
import VariantImageUpload from "./VariantImageUpload";
import * as Yup from "yup";
import { cloneDeep, isEqual } from "lodash";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CreateProductService,
  UpdateProductService,
} from "../../../../services/ProductService";
import { GetAdminProductDetailService } from "../../../../services/AdminService";
import { adminContext } from "../../../../context/AdminContext";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";
import { GetCategoriesService } from "../../../../services/CategoryService";

const UNSAVED_KEY = "admin-unsaved-changes";
const clothingSizeOptions = ["XS", "S", "M", "L", "XL", "XXL"].map((s) => ({
  label: s,
  value: s,
}));
const shoeSizeOptions = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44"].map((s) => ({
  label: s,
  value: s,
}));
const getSizeOptions = (category) =>
  category === "giay-tui" ? shoeSizeOptions : clothingSizeOptions;

const normalizeImages = (list = []) =>
  (list || []).map((item) => ({
    url: item?.url || "",
    name: item?.name || "",
  }));

const normalizeUploadFileList = (list = []) =>
  (list || [])
    .filter((item) => item?.url)
    .map((item, index) => ({
      uid: item?.uid || item?.asset_id || item?._id || `cover-${index}-${item.url}`,
      name:
        item?.name ||
        (item.url.includes("/")
          ? item.url.slice(item.url.lastIndexOf("/") + 1)
          : `image-${index + 1}`),
      status: item?.status || "done",
      url: item.url,
    }));

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tokenAdmin } = useContext(adminContext);
  //! Props

  //! State
  const [fileList, setFileList] = useState([
    // {
    //   uid: "-1",
    //   name: "image.png",
    //   // status: "done",
    //   url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    // },
  ]);
  const [data, setData] = useState({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [hoveredVariantIndex, setHoveredVariantIndex] = useState(null);
  const initialImagesRef = useRef(normalizeImages([]));
  const isEditMode = Boolean(id && id !== "create");

  const { isLoading, isFetching } = useQuery({
    queryKey: ["product-detail-admin", id, tokenAdmin],
    queryFn: () => GetAdminProductDetailService(id, tokenAdmin),
    enabled: Boolean(isEditMode && tokenAdmin),
    refetchOnWindowFocus: false,
    retry: 2,
    onSuccess: (response) => {
      const { success, product } = response || {};
      if (success && product) {
        setData(product);
        setFileList(normalizeUploadFileList(product.images || []));
        initialImagesRef.current = normalizeImages(product.images || []);
      } else {
        setData({});
        setFileList([]);
        initialImagesRef.current = normalizeImages([]);
      }
    },
  });
  const { data: categoryResp } = useQuery(["categories-admin-form"], () =>
    GetCategoriesService({ all: true })
  );
  const mutateCreate = useMutation({
    mutationFn: (data) => CreateProductService(data, tokenAdmin),
  });

  const mutateUpdate = useMutation({
    mutationFn: (data) => UpdateProductService(id, data, tokenAdmin),
  });
  //! Function
  const handleSubmit = useCallback(
    async (values) => {
      const variants = (values.variants || [])
        .filter((row) => row?.color && row?.size)
        .map((row, idx) => {
          const matchColor = colorsList.find((c) => c.value === row.color);
          const colorLabel = matchColor?.label || row.color;
          const variantId = row.id || row._id;
          return {
            ...(variantId ? { _id: variantId } : {}),
            sku:
              row.sku ||
              `${(values.name || "PRODUCT")
                .replace(/\s+/g, "-")
                .toUpperCase()}-${row.color}-${row.size}-${idx}`,
            color: {
              name: row.color,
              hex: matchColor?.value?.startsWith("#") ? matchColor.value : "#cccccc",
              label: colorLabel,
            },
            size: row.size,
            price: Number(row.price || values.price || 0),
            compareAtPrice: null,
            inventory: Number(row.amount || 0),
            imageUrl: row.imageUrl || "",
            isActive: row.isActive !== false,
          };
        });
      const normalizedImages = normalizeImages(fileList);
      if (variants.length === 0) {
        toast.error("Add at least one valid variant (color + size)");
        return;
      }
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("price", values.price);
      formData.append("images", JSON.stringify(normalizedImages));
      formData.append("variants", JSON.stringify(variants));
      formData.append("company", values.company);
      formData.append("description", values.description);
      formData.append("category", values.category);
      if (values.status) {
        formData.append("status", values.status);
      }
      try {
        if (id) {
          const response = await mutateUpdate.mutateAsync(formData);
          const { success, message } = response;
          if (!success) {
            throw new Error(message);
          }
          toast.success(message);
          sessionStorage.removeItem(UNSAVED_KEY);
          navigate("/admin/product", { replace: true });
        } else {
          const response = await mutateCreate.mutateAsync(formData);
          const { success, message } = response;
          if (!success) {
            throw new Error(message);
          }
          toast.success(message);
          sessionStorage.removeItem(UNSAVED_KEY);
          navigate("/admin/product", { replace: true });
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    },
    [fileList]
  );

  const handleAddVariant = useCallback((helperFormik) => {
    const { values, setFieldValue } = helperFormik;
    const defaultSize = values.category === "giay-tui" ? "38" : "M";
    setFieldValue("variants", [
      ...(values.variants || []),
      { color: "", size: defaultSize, amount: 0, price: values.price || 0, imageUrl: "" },
    ]);
  }, []);

  const handleRemoveVariant = useCallback((index, helperFormik) => {
    const { values, setFieldValue } = helperFormik;
    const variants = cloneDeep(values.variants || []).filter(
      (_, ind) => ind !== index
    );
    setFieldValue("variants", variants);
  }, []);

  const categorySelectOptions = useMemo(() => {
    const dynamic = (categoryResp?.data || [])
      .filter((c) => c?.slug)
      .map((c) => ({
        label: `${c.name}`,
        value: c.slug,
      }));
    const base = (dynamic.length ? dynamic : categoryList.map((c) => ({
      label: `${c.label}`,
      value: c.value,
    })));
    const cur = data?.category;
    if (!cur) return base;
    if (categoryList.some((c) => c.value === cur)) return base;
    return [
      {
        label: `⚠ ${labelForCategory(cur)} (legacy category)`,
        value: cur,
      },
      ...base,
    ];
  }, [categoryResp?.data, data?.category]);

  const imagesDirty = useMemo(
    () =>
      !isEqual(normalizeImages(fileList), initialImagesRef.current),
    [fileList]
  );
  const hasUnsavedChanges = isFormDirty || imagesDirty;


  useEffect(() => {
    if (id) return;
    initialImagesRef.current = normalizeImages([]);
  }, [id]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      sessionStorage.setItem(UNSAVED_KEY, "1");
    } else {
      sessionStorage.removeItem(UNSAVED_KEY);
    }
  }, [hasUnsavedChanges]);

  useEffect(
    () => () => {
      sessionStorage.removeItem(UNSAVED_KEY);
    },
    []
  );

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handlePopState = () => {
      const shouldDiscard = window.confirm(
        "You have unsaved changes. Discard and leave this page?"
      );
      if (shouldDiscard) {
        sessionStorage.removeItem(UNSAVED_KEY);
        return;
      }
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  //! Render
  return (
    <Fragment>
      <Formik
        initialValues={{
          name: data?.name ?? "",
          company: data?.company ?? companyList[0].value,
          category:
            data?.category ?? categorySelectOptions?.[0]?.value ?? categoryList[0].value,
          status: data?.status ?? "active",
          price: data?.price ?? 0,
          description: data?.description ?? "",
          variants:
            data?.variants?.map((v) => ({
              id: v?._id || v?.id || "",
              _id: v?._id || v?.id || "",
              color: v?.color?.name || "",
              size: v?.size || "M",
              amount: Number(v?.inventory || 0),
              price: Number(v?.price || data?.price || 0),
              sku: v?.sku || "",
              imageUrl: v?.imageUrl || "",
              isActive: v?.isActive !== false,
            })) ??
            data?.stock?.map((v) => ({
              id: v?._id || "",
              _id: v?._id || "",
              color: v?.color || "",
              size: v?.size || "M",
              amount: Number(v?.amount || 0),
              price: Number(v?.price || data?.price || 0),
              sku: v?.sku || "",
              imageUrl: "",
              isActive: true,
            })) ?? [{ color: "", size: "M", amount: 0, price: 0, imageUrl: "" }],
        }}
        enableReinitialize
        validationSchema={Yup.object({
          name: Yup.string().required("Name is required"),
          company: Yup.string().required("Brand is required"),
          category: Yup.string().required("Category is required"),
          status: Yup.string()
            .oneOf(
              ["active", "draft"],
              "Status must be active or draft"
            )
            .required("Status is required"),
          price: Yup.number().required("Price is required"),
          description: Yup.string().required("Description is required"),
          variants: Yup.array()
            .of(
              Yup.object({
                color: Yup.string().required("Color is required"),
                size: Yup.string().required("Size is required"),
                amount: Yup.number()
                  .min(0, "Stock must be 0 or more")
                  .required("Stock is required"),
                price: Yup.number()
                  .min(0, "Price must be 0 or more")
                  .required("Variant price is required"),
              })
            )
            .min(1, "Add at least one variant"),
        })}
        validateOnBlur={false}
        validateOnChange={false}
        validateOnMount={false}
        onSubmit={handleSubmit}
      >
        {(helperFormik) => {
          const renderUnsavedChanges = helperFormik.dirty || imagesDirty;
          if (isFormDirty !== helperFormik.dirty) {
            setTimeout(() => setIsFormDirty(helperFormik.dirty), 0);
          }
          return (
            <Form>
              <Paper style={{ marginBottom: "1rem" }}>
                <Flex align={"center"} justify={"space-between"}>
                  <h4 style={{ marginBottom: "0" }}>
                    {id ? "Edit product" : "New product"}
                  </h4>
                  <Flex align={"center"} justify="flex-end" gap={"middle"}>
                    <button
                      className="btn"
                      type="submit"
                      style={{ padding: "6px 24px" }}
                      disabled={
                        mutateCreate.isLoading ||
                        mutateUpdate.isLoading ||
                        !renderUnsavedChanges
                      }
                    >
                      {mutateCreate.isLoading || mutateUpdate.isLoading ? (
                        <HashLoader size={25} color="#decbc0" />
                      ) : (
                        "Save"
                      )}
                    </button>
                    <Button
                      icon={<RollbackOutlined />}
                      onClick={() => {
                        if (renderUnsavedChanges) {
                          Modal.confirm({
                            title: "Discard unsaved changes?",
                            content:
                              "You have unsaved changes. Leave this page and discard them?",
                            okText: "Discard",
                            cancelText: "Stay",
                            onOk: () => {
                              sessionStorage.removeItem(UNSAVED_KEY);
                              navigate("/admin/product", { replace: true });
                            },
                          });
                          return;
                        }
                        navigate("/admin/product", { replace: true });
                      }}
                    />
                  </Flex>
                </Flex>
              </Paper>
              <Paper
                style={{ height: "calc(100vh - 184px)", overflowY: "auto" }}
              >
                {id && (isLoading || isFetching) ? (
                  <Flex
                    align="center"
                    justify="center"
                    style={{ height: "100%" }}
                  >
                    <HashLoader size={40} color="#ab7a5f" />
                  </Flex>
                ) : (
                  <Fragment>
                    <Typography.Title level={5} style={{ marginTop: 0 }}>
                      Store classification
                    </Typography.Title>
                    <Row gutter={16} style={{ marginBottom: "1rem" }}>
                      <Col span={24}>
                        <span
                          style={{
                            marginBottom: "8px",
                            fontWeight: 500,
                            display: "block",
                          }}
                        >
                          Cover images
                        </span>
                        <div style={{ marginTop: 8 }}>
                          <UploadImages
                            fileList={fileList}
                            setFileList={setFileList}
                            tokenAdmin={tokenAdmin}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <FastField
                          component={InputCommon}
                          name="name"
                          title="Product name"
                          placeholder="e.g. Crew neck tee"
                        />
                      </Col>
                      <Col span={8}>
                        <FastField
                          component={SelectCommon}
                          name="company"
                          options={companyList.map((c) => ({
                            label: c.label,
                            value: c.value,
                          }))}
                          title="Brand"
                          placeholder="Select brand"
                          style={{ width: "100%" }}
                        />
                      </Col>
                      <Col span={8}>
                        <span style={{ marginBottom: "8px", fontWeight: 500, display: "block" }}>
                          Category
                        </span>
                        <SelectCommon
                          field={{ name: "category", value: helperFormik.values.category }}
                          form={{
                            errors: helperFormik.errors,
                            touched: helperFormik.touched,
                            setFieldValue: (name, val) => {
                              helperFormik.setFieldValue(name, val);
                              const isShoe = val === "giay-tui";
                              const defaultSize = isShoe ? "38" : "M";
                              const updated = (helperFormik.values.variants || []).map((v) => ({
                                ...v,
                                size: getSizeOptions(val).some((o) => o.value === v.size)
                                  ? v.size
                                  : defaultSize,
                              }));
                              helperFormik.setFieldValue("variants", updated);
                            },
                          }}
                          options={categorySelectOptions}
                          placeholder="Select category"
                          style={{ width: "100%" }}
                        />
                        {helperFormik.errors.category && (
                          <span className="err-text">{helperFormik.errors.category}</span>
                        )}
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: "1rem" }}>
                      <Col span={8}>
                        <FastField
                          component={SelectCommon}
                          name="status"
                          options={productStatusFormOptions}
                          title="Storefront status"
                          placeholder="Select status"
                          style={{ width: "100%" }}
                        />
                        <div style={{ marginTop: "1rem" }}>
                          <FastField
                            component={InputCommon}
                            name="price"
                            title="Base price"
                            placeholder="VND"
                            type="number"
                            prefix={"₫"}
                          />
                        </div>
                      </Col>
                      <Col span={16}>
                        <FastField
                          component={InputCommon}
                          name="description"
                          title="Description"
                          placeholder="Short description, material, fit…"
                          isTextArea={true}
                        />
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: "1rem" }}>
                      <Card
                        title="Product Variants"
                        style={{ width: "100%" }}
                        extra={
                          <Button
                            icon={<PlusOutlined />}
                            onClick={() => handleAddVariant(helperFormik)}
                          />
                        }
                      >
                        {(helperFormik.values.variants || []).map((el, index) => {
                          const rawColor = el.color;
                          const colorHex =
                            typeof rawColor === "object" && rawColor?.hex
                              ? rawColor.hex
                              : typeof rawColor === "string" &&
                                  rawColor.startsWith("#")
                                ? rawColor
                                : colorsList.find((c) => c.value === rawColor)
                                    ?.value || "";
                          return (
                            <Card.Grid
                              style={{ width: "100%", position: "relative" }}
                              key={index}
                              onMouseEnter={() => setHoveredVariantIndex(index)}
                              onMouseLeave={() => setHoveredVariantIndex(null)}
                            >
                              {index === 0 && (
                                <Row gutter={16} style={{ marginBottom: 8 }}>
                                  <Col span={3}>
                                    <span style={{ fontWeight: 500, display: "block" }}>
                                      Variant image
                                    </span>
                                  </Col>
                                  <Col span={6}>
                                    <span style={{ fontWeight: 500, display: "block" }}>
                                      Color
                                    </span>
                                  </Col>
                                  <Col span={6}>
                                    <span style={{ fontWeight: 500, display: "block" }}>
                                      Size
                                    </span>
                                  </Col>
                                  <Col span={5}>
                                    <span style={{ fontWeight: 500, display: "block" }}>
                                      Stock qty
                                    </span>
                                  </Col>
                                  <Col span={4}>
                                    <span style={{ fontWeight: 500, display: "block" }}>
                                      Price
                                    </span>
                                  </Col>
                                </Row>
                              )}
                              <Row gutter={16} align="middle">
                                <Col span={3}>
                                  <VariantImageUpload
                                    uploadUid={`variant-${index}`}
                                    imageUrl={el?.imageUrl}
                                    tokenAdmin={tokenAdmin}
                                    onUrlChange={(url) =>
                                      helperFormik.setFieldValue(
                                        `variants[${index}].imageUrl`,
                                        url
                                      )
                                    }
                                  />
                                </Col>
                                <Col span={6}>
                                  <Flex gap={6} align="center">
                                    <div
                                      style={{
                                        width: "24px",
                                        height: "24px",
                                        flexShrink: 0,
                                        background:
                                          colorHex &&
                                          String(colorHex).startsWith("#")
                                            ? colorHex
                                            : "transparent",
                                        borderRadius: "4px",
                                        border: "1px solid #e8e8e8",
                                      }}
                                    />
                                    <FastField
                                      component={SelectCommon}
                                      name={`variants[${index}].color`}
                                      placeholder="Color"
                                      options={colorsList}
                                      style={{ width: "100%" }}
                                    />
                                  </Flex>
                                </Col>
                                <Col span={6}>
                                  <FastField
                                    component={SelectCommon}
                                    name={`variants[${index}].size`}
                                    placeholder="Size"
                                    options={getSizeOptions(helperFormik.values.category)}
                                    style={{ width: "100%" }}
                                  />
                                </Col>
                                <Col span={5}>
                                  <FastField
                                    component={InputCommon}
                                    name={`variants[${index}].amount`}
                                    placeholder="Stock qty"
                                    type="number"
                                  />
                                </Col>
                                <Col span={4}>
                                  <FastField
                                    component={InputCommon}
                                    name={`variants[${index}].price`}
                                    placeholder="Variant price"
                                    type="number"
                                  />
                                </Col>
                              </Row>
                              <Button
                                icon={<CloseOutlined />}
                                type="text"
                                danger
                                style={{
                                  position: "absolute",
                                  right: 6,
                                  top: 6,
                                  opacity: hoveredVariantIndex === index ? 1 : 0,
                                  pointerEvents:
                                    hoveredVariantIndex === index
                                      ? "auto"
                                      : "none",
                                }}
                                disabled={helperFormik.values.variants.length === 1}
                                onClick={() =>
                                  handleRemoveVariant(index, helperFormik)
                                }
                              />
                              <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 4 }}>
                                <ErrorMessage
                                  name={`variants[${index}].color`}
                                  component="div"
                                />
                                <ErrorMessage
                                  name={`variants[${index}].size`}
                                  component="div"
                                />
                                <ErrorMessage
                                  name={`variants[${index}].amount`}
                                  component="div"
                                />
                                <ErrorMessage
                                  name={`variants[${index}].price`}
                                  component="div"
                                />
                              </div>
                            </Card.Grid>
                          );
                        })}
                      </Card>
                    </Row>
                  </Fragment>
                )}
              </Paper>
            </Form>
          );
        }}
      </Formik>
    </Fragment>
  );
};

export default ProductForm;
