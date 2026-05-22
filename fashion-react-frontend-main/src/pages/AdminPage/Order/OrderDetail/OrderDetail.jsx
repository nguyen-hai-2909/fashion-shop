import { FormOutlined, RollbackOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Flex, Tag } from "antd";
import { Fragment, useCallback, useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";
import Paper from "../../../../common/Paper";
import { enumPaymentStatus, enumStatus } from "../../../../constants";
import { adminContext } from "../../../../context/AdminContext";
import { GetOrderAdminDetailService } from "../../../../services/AdminService";
import { format } from "timeago.js";
import ModalChangeStatus from "../Modal/ModalChangeStatus";
import ModalChangePaymentStatus from "../Modal/ModalChangePaymentStatus";
import {
  cartImageUrl,
  formatCurrency,
  formatPaymentMethod,
} from "../../../../utils";
const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tokenAdmin } = useContext(adminContext);
  //! Props

  //! State
  const [isModalStatus, setIsModalStatus] = useState(false);
  const [isModalPayment, setIsModalPayment] = useState(false);
  const [data, setData] = useState({});
  const { isLoading, isFetching, refetch } = useQuery({
    queryKey: ["order-detail", id, tokenAdmin],
    queryFn: () => GetOrderAdminDetailService(id, tokenAdmin),
    enabled: Boolean(tokenAdmin && id),
    onSuccess: (response) => {
      const { success, data: payload } = response || {};
      if (success && payload) {
        setData(payload);
      } else {
        setData({});
      }
    },
  });
  //! Function
  const handleChangeModal = useCallback(
    () => setIsModalStatus((active) => !active),
    []
  );
  const handleChangeModalPayment = useCallback(
    () => setIsModalPayment((active) => !active),
    []
  );
  //! Render
  const products = data?.products || [];
  const subtotal = data?.totalPrice ?? 0;
  const total = data?.totalCurrentPrice ?? 0;

  return (
    <Fragment>
      <Paper style={{ marginBottom: "1rem" }}>
        <Flex align={"center"} justify={"space-between"}>
          <h4 style={{ marginBottom: "0" }}>
            {data.orderNumber
              ? `Order ${data.orderNumber}`
              : `Order #${id?.slice(-8) || ""}`}
          </h4>
          <Flex align={"center"} justify="flex-end" gap={"middle"}>
            <Button
              icon={<RollbackOutlined />}
              onClick={() => {
                navigate("/admin/order", { replace: true });
              }}
            />
          </Flex>
        </Flex>
      </Paper>
      <Paper style={{ height: "calc(100vh - 184px)", overflowY: "auto" }}>
        {isLoading || isFetching ? (
          <Flex align={"center"} justify="center" style={{ height: "100%" }}>
            <HashLoader size={35} color="#ab7a5f" />
          </Flex>
        ) : (
          <Card
            title={
              <Flex
                vertical
                style={{ paddingTop: "12px", paddingBottom: "12px" }}
              >
                <p style={{ fontSize: "16px", marginBottom: 4 }}>
                  Order detail
                </p>
                <p style={{ color: "#8c8c8c", fontWeight: "400", margin: 0 }}>
                  Placed: {data.createdAt ? format(data.createdAt) : "—"}
                </p>
              </Flex>
            }
          >
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <Card.Grid style={{ width: "33.33%", textAlign: "left" }}>
                <span style={{ fontWeight: 500 }}>Email: </span>
                {data.email || "—"}
              </Card.Grid>
              <Card.Grid style={{ width: "33.33%", textAlign: "left" }}>
                <span style={{ fontWeight: 500 }}>Recipient: </span>
                {data.name || "—"}
              </Card.Grid>
              <Card.Grid style={{ width: "33.33%", textAlign: "left" }}>
                <span style={{ fontWeight: 500 }}>Phone: </span>
                {data.phoneNumber || "—"}
              </Card.Grid>
              <Card.Grid style={{ width: "50%" }}>
                <Flex align={"center"} justify="space-between">
                  <Flex align={"center"} gap="small">
                    <span style={{ fontWeight: 500 }}>Order status: </span>
                    {
                      <Tag
                        color={
                          enumStatus.find((el) => el.value === data.status)
                            ?.color
                        }
                      >
                        {enumStatus.find((el) => el.value === data.status)
                          ?.label ||
                          data.status ||
                          "—"}
                      </Tag>
                    }
                  </Flex>
                  <Button icon={<FormOutlined />} onClick={handleChangeModal} />
                </Flex>
              </Card.Grid>
              <Card.Grid style={{ width: "50%" }}>
                <span style={{ fontWeight: 500 }}>Payment method: </span>
                {formatPaymentMethod(data.paymentType)}
              </Card.Grid>
              <Card.Grid style={{ width: "50%" }}>
                <Flex align={"center"} justify="space-between">
                  <Flex align={"center"} gap="small">
                    <span style={{ fontWeight: 500 }}>Payment status: </span>
                    {
                      <Tag
                        color={
                          enumPaymentStatus.find(
                            (el) => el.value === data.paymentStatus
                          )?.color
                        }
                      >
                        {enumPaymentStatus.find(
                          (el) => el.value === data.paymentStatus
                        )?.label ||
                          data.paymentStatus ||
                          "—"}
                      </Tag>
                    }
                  </Flex>
                  <Button
                    icon={<FormOutlined />}
                    onClick={handleChangeModalPayment}
                  />
                </Flex>
              </Card.Grid>
              <Card.Grid style={{ width: "100%" }}>
                <span style={{ fontWeight: 500 }}>Ship to: </span>
                {data.address || "—"}
              </Card.Grid>
              <Card.Grid style={{ width: "100%" }}>
                <span style={{ fontWeight: 500 }}>Note: </span>
                {data.note || "—"}
              </Card.Grid>
              {products.map((el) => {
                return (
                  <Card.Grid
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    key={el?._id}
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
                        src={cartImageUrl({ url: el?.img })}
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
                        {el?.name}
                      </span>
                      <span style={{ color: "#8c8c8c", display: "block" }}>
                        Unit price: {formatCurrency(el?.price)}
                      </span>
                      <span style={{ color: "#8c8c8c", display: "block" }}>
                        Variant: {el?.color || "—"}
                      </span>
                      <span style={{ color: "#8c8c8c", display: "block" }}>
                        Qty: {el?.amount}
                      </span>
                    </div>
                    <div className="product-price">
                      <span style={{ fontWeight: 500, fontSize: "16px" }}>
                        {formatCurrency(
                          (el?.amount ?? 0) *
                            (el?.price ?? 0)
                        )}
                      </span>
                    </div>
                  </Card.Grid>
                );
              })}
              <Card.Grid style={{ width: "30%" }}>
                <h5>Subtotal: </h5>
              </Card.Grid>
              <Card.Grid
                style={{
                  width: "70%",
                  textAlign: "end",
                  fontWeight: 500,
                  fontSize: "16px",
                }}
              >
                {formatCurrency(subtotal)}
              </Card.Grid>
              <Card.Grid style={{ width: "30%" }}>
                <h5>Discount: </h5>
              </Card.Grid>
              <Card.Grid
                style={{
                  width: "70%",
                  textAlign: "end",
                  fontWeight: 500,
                  fontSize: "16px",
                }}
              >
                {formatCurrency(data.totalDiscount)}
              </Card.Grid>
              <Card.Grid style={{ width: "50%" }}>
                <span style={{ fontWeight: 500 }}>Discount code: </span>
                {data.discount?.discountCode || "—"}
              </Card.Grid>
              <Card.Grid style={{ width: "50%" }}>
                <span style={{ fontWeight: 500 }}>Discount amount: </span>
                {formatCurrency(data.discount?.discountValue ?? 0)}
              </Card.Grid>
              <Card.Grid style={{ width: "30%" }}>
                <h5>Shipping: </h5>
              </Card.Grid>
              <Card.Grid
                style={{
                  width: "70%",
                  textAlign: "end",
                  fontWeight: 500,
                  fontSize: "16px",
                }}
              >
                {formatCurrency(data.shippingFee)}
              </Card.Grid>
              <Card.Grid style={{ width: "30%" }}>
                <h4 style={{ marginBottom: 0 }}>Total: </h4>
              </Card.Grid>
              <Card.Grid
                style={{
                  width: "70%",
                  textAlign: "end",
                  fontWeight: 500,
                  fontSize: "18px",
                }}
              >
                {formatCurrency(total)}
              </Card.Grid>
            </div>
          </Card>
        )}
      </Paper>
      {isModalStatus && (
        <ModalChangeStatus
          isActive={isModalStatus}
          changeActive={handleChangeModal}
          refetch={refetch}
          status={data.status}
        />
      )}
      {isModalPayment && (
        <ModalChangePaymentStatus
          changeActive={handleChangeModalPayment}
          isActive={isModalPayment}
          refetch={refetch}
          status={data.paymentStatus}
        />
      )}
    </Fragment>
  );
};

export default OrderDetail;
