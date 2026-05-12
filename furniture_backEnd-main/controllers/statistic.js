const { isEmpty, result } = require("lodash");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");

const getStatistic = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const countUser = await User.find({
      createdAt: {
        $gte: new Date(startDate),
        $lt: new Date(
          new Date(endDate).setDate(new Date(endDate).getDate() + 1)
        ),
      },
    }).count();
    const countOrder = await Order.find({
      createdAt: {
        $gte: new Date(startDate),
        $lt: new Date(
          new Date(endDate).setDate(new Date(endDate).getDate() + 1)
        ),
      },
    }).count();
    const orderNumberLast7Days = await Order.find({
      createdAt: {
        $gte: new Date(startDate),
        $lt: new Date(
          new Date(endDate).setDate(new Date(endDate).getDate() + 1)
        ),
      },
    });

    const orderRevenue = orderNumberLast7Days.reduce((result, current) => {
      return result + current.totalCurrentPrice;
    }, 0);
    const orderData = orderNumberLast7Days.reduce((result, current) => {
      const date = new Date(current.createdAt).toISOString().slice(0, 10);
      if (result.find((el) => el.date.includes(date))) {
        const arr = result.map((item) => {
          if (item.date.includes(date)) {
            return {
              ...item,
              sum: Number(item.sum) + 1,
              totalCurrentPrice:
                Number(item.totalCurrentPrice) +
                Number(current.totalCurrentPrice),
            };
          } else {
            return item;
          }
        });
        return [...arr];
      }
      return [
        ...result,
        { date: date, sum: 1, totalCurrentPrice: current.totalCurrentPrice },
      ];
    }, []);
    return res.status(200).json({
      success: true,
      message: "Success!",
      orderData: orderData,
      dataCount: {
        orders: countOrder,
        users: countUser,
        revenue: orderRevenue,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};

module.exports = {
  getStatistic,
};
