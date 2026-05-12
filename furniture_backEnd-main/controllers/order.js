const mongoose = require("mongoose");
const OrderSchema = require("../models/Order");
const ProductSchema = require("../models/Product");
const User = require("../models/User");
const Discount = require("../models/Discount");
const Product = require("../models/Product");

const getAllOrder = async (req, res) => {
  const { id: idUser } = res.locals.token;
  const perPage = req.query.perPage || 10;
  const page = req.query.page || 1;
  const email = req.query.email || "";
  try {
    const orders = await OrderSchema.find({
      idUser: idUser,
      email: { $regex: email },
    })
      .sort({ updatedAt: -1 })
      .skip(perPage * page - perPage)
      .limit(perPage);
    const count = await OrderSchema.find({
      idUser: idUser,
      email: { $regex: email },
    }).count();
    return res.status(200).json({
      success: true,
      message: "Success",
      data: orders,
      page: {
        totalPage: Math.ceil(count / Number(perPage)),
        currentPage: page,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong" });
  }
};

const createOrder = async (req, res) => {
  const data = req.body;
  const { id: userID } = res.locals.token;
  const totalPrice = JSON.parse(data.products).reduce((result, current) => {
    if (current.amount <= current.maxAmount) {
      return result + current.amount * current.price;
    } else {
      return result + current.maxAmount * current.price;
    }
  }, 0);
  const totalDiscount = data.valueDiscount.toString().includes("%")
    ? ((totalPrice / 100) * Number(data.valueDiscount?.split("%")[0])).toFixed(
        2
      )
    : Number(data.valueDiscount);
  try {
    if (data.discountCode) {
      await Discount.findOneAndUpdate(
        { idDiscount: data.discountCode },
        { $inc: { amountUse: -1 } }
      );
    }
    JSON.parse(data.products).forEach(async (el) => {
      await Product.updateOne(
        { _id: el?.id.split("_")[0], "stock._id": el.id.split("_")[1] },
        {
          $inc: {
            "stock.$.amount": -Number(
              el?.amount <= el?.maxAmount ? el?.amount : el?.maxAmount
            ),
          },
        }
      );
    });
    const order = await OrderSchema.create({
      idUser: userID,
      name: data.name,
      phoneNumber: data.phoneNumber,
      email: data.email,
      address: data.address,
      note: data.note,
      discount: {
        discountCode: data.discountCode,
        discountValue: data.valueDiscount,
      },
      products: JSON.parse(data.products).map((el) => {
        return {
          idProduct: el?.id,
          amount: el?.amount <= el?.maxAmount ? el?.amount : el?.maxAmount,
          color: el?.color,
          price: el?.price,
          img: el?.image.url,
          name: el?.name,
        };
      }),
      totalDiscount: totalDiscount,
      shippingFee: data.shippingFee,
      totalPrice: totalPrice,
      totalCurrentPrice: totalPrice + Number(data.shippingFee) - totalDiscount,
    });
    return res
      .status(200)
      .json({ success: true, message: "Success", order: order });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong" });
  }
};

const getOrderDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await OrderSchema.findById(id);
    return res
      .status(200)
      .json({ success: true, message: "Success!", data: order });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};
module.exports = {
  getAllOrder,
  createOrder,
  getOrderDetail,
};
