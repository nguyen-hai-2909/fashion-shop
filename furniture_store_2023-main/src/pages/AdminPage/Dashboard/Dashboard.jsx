import { useQuery } from "@tanstack/react-query";
import { Card, Col, ConfigProvider, Flex, Row, Statistic } from "antd";
import { Fragment, useContext, useEffect, useState } from "react";
import HashLoader from "react-spinners/HashLoader";
import { adminContext } from "../../../context/AdminContext";
import { GetDataDashboardService } from "../../../services/DashboardService";
import Paper from "../../../common/Paper";
import { Line } from "@ant-design/plots";
import { formatCurrency, getArrLast7Days } from "../../../utils";

const Dashboard = () => {
  const { tokenAdmin, dispatch } = useContext(adminContext);
  //! Props

  //! State
  const [countData, setCountData] = useState();
  const [linesData, setLinesData] = useState([]);
  const { isLoading, isFetching, refetch } = useQuery(
    ["dashboard"],
    () => GetDataDashboardService(tokenAdmin),
    {
      enabled: false,
      onSuccess: (response) => {
        const { success } = response;
        if (success) {
          setCountData(response.countNumber);
          setLinesData(
            getArrLast7Days().map((el) => {
              const orderItem = response?.orderData?.find((item) =>
                item.date.includes(el)
              );
              if (orderItem) {
                return {
                  name: "Order revenue",
                  time: el,
                  value: orderItem.totalCurrentPrice,
                };
              } else {
                return {
                  name: "Order revenue",
                  time: el,
                  value: 0,
                };
              }
            })
          );
        } else {
          if (response.statusCode === 404) {
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
  const data = [...linesData];
  const config = {
    data,
    xField: "time",
    yField: "value",
    seriesField: "name",
    yAxis: {
      label: {
        formatter: (v) => `${formatCurrency(v)}`,
      },
    },
    legend: {
      position: "top",
    },
    smooth: true,
    animation: {
      appear: {
        animation: "path-in",
        duration: 5000,
      },
    },
  };

  return (
    <ConfigProvider
      key={"paper"}
      theme={{
        token: {
          colorBgContainer: "#ffffff",
          colorPrimary: "#617d98",
        },
      }}
    >
      <Fragment>
        {isLoading || isFetching ? (
          <Flex align={"center"} justify="center" style={{ height: "100%" }}>
            <HashLoader size={45} color="#decbc0" />
          </Flex>
        ) : (
          <Fragment>
            <Row gutter={16}>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic title="Orders" value={countData?.orders} />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic title="Products" value={countData?.products} />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic title="Customers" value={countData?.users} />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic title="Discounts" value={countData?.discounts} />
                </Card>
              </Col>
            </Row>
            <Card
              title="Order totals (last 7 days)"
              bordered={false}
              style={{ marginTop: "1rem", height: "550px" }}
            >
              <Paper style={{ height: "100%" }}>
                <Line {...config} />
              </Paper>
            </Card>
          </Fragment>
        )}
      </Fragment>
    </ConfigProvider>
  );
};

export default Dashboard;
