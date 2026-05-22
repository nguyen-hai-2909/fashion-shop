import { useQuery } from "@tanstack/react-query";
import { Button, Card, Flex } from "antd";
import { Fragment, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";
import { GetOrderUserDetailService } from "../../../services/OrderService";
import "./OrderAccountDetail.scss";
import { RollbackOutlined } from "@ant-design/icons";
import { authContext } from "../../../context/AuthContext";
import { cartImageUrl, formatCurrency, formatPaymentMethod } from "../../../utils";
import { format } from "timeago.js";

const OrderAccountDetail = () => {
  const { dispatch, token } = useContext(authContext);
  const navigate = useNavigate();
  const { id } = useParams();
  //! Props

  //! State
  const [data, setData] = useState({});
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
  //! Function

  //! Effect
  useEffect(() => {
    refetch && refetch();
  }, []);
  //! Render
  const shipping = data?.shippingAddress || {};
  const products = data?.items || [];
  const canReviewOrder = ["pending", "confirmed", "shipping", "delivered"].includes(
    String(data?.status || "").toLowerCase()
  );
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
          <Button
            icon={<RollbackOutlined />}
            shape="default"
            onClick={() => {
              navigate("/user/order", { replace: true });
            }}
          />
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
                <span style={{ fontWeight: 500 }}>Created date: </span>
                {format(data.createdAt)}
              </Card.Grid>
              <Card.Grid style={{ width: "50%", textAlign: "left" }}>
                <span style={{ fontWeight: 500 }}>Updated date: </span>
                {format(data.updatedAt)}
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
                        Variant: {el?.variantTitle || "—"}
                      </span>
                      <span style={{ color: "#d9d9d9" }}>
                        Amount: {el?.quantity ?? 0}
                      </span>
                    </div>
                    <div className="product-price" style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 500, fontSize: "16px" }}>
                        {formatCurrency(el?.subtotal ?? 0)}
                      </span>
                      {canReviewOrder && (
                        <div style={{ marginTop: 8 }}>
                          <Link to={`/order/${id}/review/${idx}`}>
                            {(el?.rating ?? 0) > 0 ? "Edit review" : "Rate"}
                          </Link>
                        </div>
                      )}
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
