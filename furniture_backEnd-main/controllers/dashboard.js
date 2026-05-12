const mongoose = require("mongoose");
const ProductSchema = require("../models/Product");
const UserSchema = require("../models/User");
const OrderSchema = require("../models/Order");
const Order = require("../models/Order");
const User = require("../models/User");
const Discount = require("../models/Discount");
const moment = require("moment");
const { cloneDeep, reduce } = require("lodash");
const getDashboard = async (req, res) => {
  try {
    const countOrder = await Order.find().count();
    const countProduct = await ProductSchema.find().count();
    const countUser = await User.find().count();
    const discountCount = await Discount.find().count();
    const orderNumberLast7Days = await Order.find({
      dateField: { $gte: moment().startOf("day").subtract(7, "days").toDate() },
    });
    const orderData = orderNumberLast7Days.reduce((result, current) => {
      const date = new Date(current.createdAt).toISOString().slice(0, 10);
      if (result.find((el) => el.date.includes(date))) {
        const arr = result.map((item) => {
          if (item.date.includes(date)) {
            return {
              ...item,
              sum: Number(item.sum) + 1,
              totalCurrentPrice: Number(item.totalCurrentPrice) + Number(current.totalCurrentPrice),
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
      countNumber: {
        orders: countOrder,
        products: countProduct,
        users: countUser,
        discounts: discountCount,
      },
      orderData: orderData,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};

module.exports = { getDashboard };
