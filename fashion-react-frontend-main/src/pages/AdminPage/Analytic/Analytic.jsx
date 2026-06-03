import { useQuery } from "@tanstack/react-query";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import HeaderTable from "../../../common/HeaderTable";
import Paper from "../../../common/Paper";
import { adminContext } from "../../../context/AdminContext";
import { GetAnalyticService } from "../../../services/AnalyticService";
import { Card, Col, DatePicker, Flex, Row, Statistic } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import HashLoader from "react-spinners/HashLoader";
import { ArrowUpOutlined } from "@ant-design/icons";
import { formatCurrency, getArrDays } from "../../../utils";
import { DualAxes } from "@ant-design/plots";

dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;
const dateFormat = "YYYY-MM-DD";

const Analytic = () => {
  const { tokenAdmin, dispatch } = useContext(adminContext);
  //! Props

  //! State
  const today = new Date().toISOString().slice(0, 10);
  const lastWeek = new Date(new Date().setDate(new Date().getDate() - 6))
    .toISOString()
    .slice(0, 10);
  const [query, setQuery] = useState({
    startDate: lastWeek,
    endDate: today,
  });
  const [countData, setCountData] = useState({
    orders: 0,
    users: 0,
    revenue: 0,
  });
  const [sumData, setSumData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const { isLoading, isFetching, refetch } = useQuery(
    ["analytic"],
    () => GetAnalyticService(tokenAdmin, query),
    {
      enabled: false,
      onSuccess: (response) => {
        const { success } = response;
        if (success) {
          setCountData((prev) => {
            return {
              ...prev,
              orders: response?.dataCount.orders,
              users: response?.dataCount.users,
              revenue: response?.dataCount.revenue,
            };
          });
          setSumData(
            getArrDays(query.startDate, query.endDate).map((el) => {
              const orderItem = response?.orderData?.find((item) =>
                item.date.includes(el)
              );
              if (orderItem) {
                return {
                  name: "Orders",
                  time: el,
                  value: orderItem.sum,
                };
              } else {
                return {
                  name: "Orders",
                  time: el,
                  value: 0,
                };
              }
            })
          );
          setRevenueData(
            getArrDays(query.startDate, query.endDate).map((el) => {
              const orderItem = response?.orderData?.find((item) =>
                item.date.includes(el)
              );
              if (orderItem) {
                return {
                  name: "Revenue",
                  time: el,
                  revenue: orderItem.totalCurrentPrice,
                };
              } else {
                return {
                  name: "Revenue",
                  time: el,
                  revenue: 0,
                };
              }
            })
          );
        } else {
          if (response?.statusCode === 404) {
            dispatch({ type: "LOG_OUT" });
          }
        }
      },
    }
  );
  //! Function
  const handleChange = useCallback((dates, datesString) => {
    if (datesString[0] === "" && datesString[1] === "") {
      setQuery((prev) => {
        return {
          ...prev,
          startDate: lastWeek,
          endDate: today,
        };
      });
    } else {
      setQuery((prev) => {
        return {
          ...prev,
          startDate: datesString[0],
          endDate: datesString[1],
        };
      });
    }
  }, []);
  const disabledDate = (current) => {
    return current && current > dayjs().endOf("day");
  };
  //! Effect
  useEffect(() => {
    refetch && refetch();
  }, [query.startDate, query.endDate]);
  //! Render

  const config = {
    data: [sumData, revenueData],
    xField: "time",
    yField: ["value", "revenue"],
    geometryOptions: [
      {
        geometry: "column",
        isGroup: true,
        seriesField: "name",
        columnWidthRatio: 0.4,
        label: {},
        color: ["#5B8FF9"],
      },
      {
        geometry: "line",
        color: "#5AD8A6",
        seriesField: "name",
      },
    ],
    legend: {
      custom: true,
      position: "bottom",
      items: [
        {
          value: "orderTotal",
          name: "Orders",
          marker: {
            symbol: "square",
            style: {
              fill: "#5B8FF9",
              r: 5,
            },
          },
        },
        {
          value: "revenue",
          name: "Revenue",
          marker: {
            symbol: "square",
            style: {
              fill: "#5AD8A6",
              r: 5,
            },
          },
        },
      ],
    },
  };

  return (
    <Fragment>
      <HeaderTable title="Analytics" onRefetch={refetch} />
      <Paper isFix={true}>
        <RangePicker
          disabledDate={disabledDate}
          value={[
            dayjs(query.startDate, dateFormat),
            dayjs(query.endDate, dateFormat),
          ]}
          onChange={handleChange}
          style={{ marginBottom: "1rem" }}
        />
        {isLoading || isFetching ? (
          <Flex align={"center"} justify="center" style={{ height: "500px" }}>
            <HashLoader size={45} color="#decbc0" />
          </Flex>
        ) : (
          <Fragment>
            <Row gutter={16} style={{ marginBottom: "1rem" }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Orders"
                    value={countData?.orders}
                    valueStyle={{ color: "#3f8600" }}
                    prefix={<ArrowUpOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Customers"
                    value={countData?.users}
                    valueStyle={{ color: "#3f8600" }}
                    prefix={<ArrowUpOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Revenue"
                    value={formatCurrency(countData?.revenue)}
                    valueStyle={{ color: "#3f8600" }}
                    prefix={<ArrowUpOutlined />}
                  />
                </Card>
              </Col>
            </Row>
            <Card style={{ marginTop: "1rem", height: "550px" }} bordered>
              <DualAxes {...config} />
            </Card>
          </Fragment>
        )}
      </Paper>
    </Fragment>
  );
};

export default Analytic;
