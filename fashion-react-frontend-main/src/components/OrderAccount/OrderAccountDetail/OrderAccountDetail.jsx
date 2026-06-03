import { useQuery } from "@tanstack/react-query";
import { Button, Card, Flex, Popconfirm, Tag } from "antd";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";
import {
  CancelOrderUserService,
  GetOrderUserDetailService,
} from "../../../services/OrderService";
import "./OrderAccountDetail.scss";
import { RollbackOutlined } from "@ant-design/icons";
import { authContext } from "../../../context/AuthContext";
import {
  cartImageUrl,
  formatCurrency,
  formatPaymentMethod,
  formatVariantTitle,
} from "../../../utils";
import { enumStatus } from "../../../constants";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

const OrderAccountDetail = () => {
  const { dispatch, token } = useContext(authContext);
  const navigate = useNavigate();
  const { id } = useParams();
  //! Props

  //! State
  const [data, setData] = useState({});
  const cancelMut = useMutation({
    mutationFn: () => CancelOrderUserService(id, token),
  });

  const { isLoading, isFetching, refetch } = useQuery(
    ["order-detail"],
    () => GetOrderUserDetailService(id, token),
    {
      enabled: false,
      onSuccess: (response) => {
        const { success, data } = response;
        if (success) {
          setData(data);
        } else {
          if (response?.statusCode == 404) {
            dispatch({ type: "LOG_OUT" });
          }
        }
      },
    }
  );
  const handleCancelOrder = useCallback(async () => {
    try {
      const res = await cancelMut.mutateAsync();
      if (!res?.success) throw new Error(res?.message);
      toast.success(res.message || "Order cancelled");
      refetch?.();
    } catch (e) {
      toast.error(e.message || "Could not cancel order");
    }
  }, [cancelMut, refetch]);

  //! Effect
  useEffect(() => {
    refetch && refetch();
  }, []);
  //! Render
  const shipping = data?.shippingAddress || {};
  const products = data?.items || [];
  const orderStatus = String(data?.status || "").toLowerCase();
  const canCancelOrder = orderStatus === "pending";
  const canReviewOrder = orderStatus === "delivered";
  const statusMeta = enumStatus.find((s) => s.value === orderStatus);
  const subtotal = data?.subtotal ?? 0;
  const discountAmount = data?.discountAmount ?? 0;
  const shippingFee = data?.shippingFee ?? 0;
  const total = data?.total ?? 0;
  const discountCode = data?.discount?.code ?? "—";
  const discountValue = data?.discount?.amount ?? 0;
  const addressText =
    [shipping?.address, shipping?.district, shipping?.city]
      .filter(Boolean)
      .join(", ") || "—";

  return (
    <Fragment>
      <Card
        title={`Order ${id}`}
        extra={
          <Flex gap={8} align="center">
            {statusMeta && (
              <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
            )}
            {canCancelOrder && (
              <Popconfirm
                title="Cancel this order?"
                description="You can only cancel while the order is pending."
                okText="Cancel order"
                okButtonProps={{ danger: true }}
                cancelText="Keep order"
                onConfirm={handleCancelOrder}
              >
                <Button danger loading={cancelMut.isLoading}>
                  Cancel order
                </Button>
              </Popconfirm>
            )}
            <Button
              icon={<RollbackOutlined />}
              shape="default"
              onClick={() => {
                navigate("/user/order", { replace: true });
              }}
            />
          </Flex>
        }
      >
        {isLoading || isFetching ? (
          <Flex align={"center"} justify="center">
            <HashLoader size={35} color="#ab7a5f" />
          </Flex>
        ) : (
          <Fragment>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <Card.Grid style={{ width: "50%", textAlign: "left" }}>
                <span style={{ fontWeight: 500 }}>Created: </span>
                {data.createdAt
                  ? new Date(data.createdAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </Card.Grid>
              <Card.Grid style={{ width: "50%", textAlign: "left" }}>
                <span style={{ fontWeight: 500 }}>Updated: </span>
                {data.updatedAt
                  ? new Date(data.updatedAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </Card.Grid>
              <Card.Grid style={{ width: "33.33%", textAlign: "left" }}>
                <span style={{ fontWeight: 500 }}>Email: </span>
                {data.userEmail || "—"}
              </Card.Grid>
              <Card.Grid style={{ width: "33.33%", textAlign: "left" }}>
                <span style={{ fontWeight: 500 }}>Full name: </span>
                {shipping?.recipientName || "—"}
              </Card.Grid>
              <Card.Grid style={{ width: "33.33%", textAlign: "left" }}>
                <span style={{ fontWeight: 500 }}>Phone number: </span>
                {shipping?.phone || "—"}
              </Card.Grid>
              <Card.Grid style={{ width: "100%" }}>
                <span style={{ fontWeight: 500 }}>Address: </span>
                {addressText}
              </Card.Grid>
              <Card.Grid style={{ width: "100%" }}>
                <span style={{ fontWeight: 500 }}>Note: </span>
                {data.note || "—"}
              </Card.Grid>
              <Card.Grid style={{ width: "100%" }}>
                <span style={{ fontWeight: 500 }}>Payment method: </span>
                {formatPaymentMethod(data?.payment?.method)}
              </Card.Grid>
              {canReviewOrder && (
                <Card.Grid style={{ width: "100%" }}>
                  <Link to={`/order/${id}/review`} className="btn" style={{ padding: "8px 16px" }}>
                    Rate products in this order
                  </Link>
                </Card.Grid>
              )}
              {products.map((el, idx) => {
                return (
                  <Card.Grid
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    key={el?._id || el?.variantId || idx}
                  >
                    <div
                      style={{
                        display: "flex",
                        width: "60px",
                        height: "60px",
                        borderRadius: "8px",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={cartImageUrl({ url: el?.imageUrl })}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                    <div className="product-info">
                      <span style={{ fontWeight: 500 }}>
                        {el?.productName}
                      </span>
                      <span style={{ color: "#d9d9d9" }}>
                        Price: {formatCurrency(el?.unitPrice ?? 0)}
                      </span>
                      <span style={{ color: "#d9d9d9" }}>
                        Variant: {formatVariantTitle(el?.variantTitle)}
                      </span>
                      <span style={{ color: "#d9d9d9" }}>
                        Amount: {el?.quantity ?? 0}
                      </span>
                    </div>
                    <div className="product-price" style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 500, fontSize: "16px" }}>
                        {formatCurrency(el?.subtotal ?? 0)}
                      </span>
                    </div>
                  </Card.Grid>
                );
              })}
              <Card.Grid style={{ width: "45%" }}>
                <h5>Subtotal: </h5>
              </Card.Grid>
              <Card.Grid
                style={{
                  width: "55%",
                  textAlign: "end",
                  fontWeight: 500,
                  fontSize: "16px",
                }}
              >
                {formatCurrency(subtotal)}
              </Card.Grid>
              <Card.Grid style={{ width: "45%" }}>
                <h5>Shipping fee: </h5>
              </Card.Grid>
              <Card.Grid
                style={{
                  width: "55%",
                  textAlign: "end",
                  fontWeight: 500,
                  fontSize: "16px",
                }}
              >
                {formatCurrency(shippingFee)}
              </Card.Grid>
              <Card.Grid
                style={{
                  width: "45%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h5>Total discount: </h5>
                <span style={{ color: "#d9d9d9" }}>
                  Discount code: {discountCode}
                </span>
                <span style={{ color: "#d9d9d9" }}>
                  Discount value: {formatCurrency(discountValue)}
                </span>
              </Card.Grid>
              <Card.Grid
                style={{
                  width: "55%",
                  textAlign: "end",
                  fontWeight: 500,
                  fontSize: "16px",
                }}
              >
                - {formatCurrency(discountAmount)}
              </Card.Grid>
              <Card.Grid style={{ width: "45%" }}>
                <h4 style={{ marginBottom: 0 }}>Total: </h4>
              </Card.Grid>
              <Card.Grid
                style={{
                  width: "55%",
                  textAlign: "end",
                  fontWeight: 500,
                  fontSize: "18px",
                }}
              >
                {formatCurrency(total)}
              </Card.Grid>
            </div>
          </Fragment>
        )}
      </Card>
    </Fragment>
  );
};

export default OrderAccountDetail;
