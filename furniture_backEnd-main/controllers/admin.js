const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const createToken = require("../middleware/createToken");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const { enumCompany, enumCategory, enumStatus } = require("../constants/enum");

const createAdmin = async (req, res) => {
  try {
    const data = req.body;
    const admin = await Admin.create({
      ...data,
      password:
        data.password.length > 5
          ? bcrypt.hashSync(data.password, salt)
          : data.password,
    });
    return res.status(200).json(admin);
  } catch (error) {
    return res.status(500).json(error);
  }
};
const loginAdmin = async (req, res) => {
  const data = req.body;
  try {
    const admin = await Admin.findOne({ email: data.email });
    const passwordAdmin = admin ? admin.password : "";
    const isCompare = await bcrypt.compare(data.password, passwordAdmin);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "User is not exist!!!" });
    }
    if (!isCompare) {
      return res
        .status(400)
        .json({ success: false, message: "Password is not true!!!" });
    }
    const token = createToken(JSON.stringify(admin._id));
    const { password, ...rest } = admin._doc;
    res.status(200).json({
      success: true,
      message: "Login successfully!",
      admin: { ...rest },
      token: token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};
const getProductAdmin = async (req, res) => {
  const perPage = req.query.perPage || 10;
  const page = req.query.page || 1;
  const query = req.query.name || "";
  const company = req.query.company || enumCompany;
  const category = req.query.category || enumCategory;
  try {
    const products = await Product.find({
      name: { $regex: new RegExp(query, "i") },
      company: { $in: [...company] },
      category: { $in: [...category] },
    })
      .skip(perPage * page - perPage)
      .limit(perPage);
    const count = await Product.find({
      name: { $regex: new RegExp(query, "i") },
      company: { $in: [...company] },
      category: { $in: [...category] },
    }).count();
    return res.status(200).json({
      success: true,
      message: "Success",
      data: products,
      page: {
        totalPage: Math.ceil(count / perPage),
        currentPage: page,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong" });
  }
};

const getUserAdmin = async (req, res) => {
  const perPage = req.query.perPage || 10;
  const page = req.query.page || 1;
  const email = req.query.email || "";
  const name = req.query.name || "";
  const phoneNumber = req.query.phoneNumber || "";
  try {
    const users = await User.find({
      email: { $regex: new RegExp(email, "i") },
      name: { $regex: new RegExp(name, "i") },
      phoneNumber: { $regex: new RegExp(phoneNumber, "i") },
    })
      .select("-password")
      .skip(perPage * page - perPage)
      .limit(perPage);
    const count = await User.find({
      email: { $regex: new RegExp(email, "i") },
      name: { $regex: new RegExp(name, "i") },
      phoneNumber: new RegExp(phoneNumber, "i"),
    }).count();
    return res.status(200).json({
      success: true,
      message: "Success",
      data: users,
      page: {
        totalPage: Math.ceil(count / Number(perPage)),
        currentPage: page,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};

const getOrderAdmin = async (req, res) => {
  const perPage = req.query.perPage || 10;
  const page = req.query.page || 1;
  const email = req.query.email || "";
  const name = req.query.name || "";
  const phoneNumber = req.query.phoneNumber || "";
  const status = req.query.status || enumStatus;
  try {
    const orders = await Order.find({
      email: { $regex: new RegExp(email, "i") },
      phoneNumber: { $regex: new RegExp(phoneNumber, "i") },
      name: { $regex: new RegExp(name, "i") },
      status: { $in: [...status] },
    })
      .sort({ createdAt: -1 })
      .skip(perPage * page - perPage)
      .limit(perPage);
    const count = await Order.find({
      email: { $regex: new RegExp(email, "i") },
      phoneNumber: { $regex: new RegExp(phoneNumber, "i") },
      name: { $regex: new RegExp(name, "i") },
      status: { $in: [...status] },
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

const getOrderAdminDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    return res
      .status(200)
      .json({ success: true, message: "Success!", data: order });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};

const updateOrderAdmin = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    await Order.findByIdAndUpdate(id, data);
    return res
      .status(200)
      .json({ success: true, message: "Update Successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!", error });
  }
};
module.exports = {
  createAdmin,
  loginAdmin,
  getProductAdmin,
  getUserAdmin,
  getOrderAdmin,
  getOrderAdminDetail,
  updateOrderAdmin,
};
