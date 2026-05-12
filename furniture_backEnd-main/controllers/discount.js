const DiscountSchema = require("../models/Discount");
const nodemailer = require("nodemailer");
const { sendMail } = require("../middleware/sendMail");
require("dotenv").config();

const getAllDiscount = async (req, res) => {
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 10;
  const idDiscount = req.query.discountCode || "";
  const valueDiscount = req.query.valueDiscount || "";
  try {
    const discounts = await DiscountSchema.find({
      idDiscount: { $regex: new RegExp(idDiscount, "i") },
      valueDiscount: { $regex: new RegExp(valueDiscount, "i") },
    })
      .sort({ createdAt: -1 })
      .skip(perPage * page - perPage)
      .limit(perPage);
    const count = await DiscountSchema.find({
      idDiscount: { $regex: new RegExp(idDiscount, "i") },
      valueDiscount: { $regex: new RegExp(valueDiscount, "i") },
    }).count();
    return res.status(200).json({
      success: true,
      message: "Success!",
      data: discounts,
      page: {
        totalPage: Math.ceil(count / perPage),
        currentPage: page,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};

const getDiscountId = async (req, res) => {
  const { id } = req.params;
  try {
    const discount = await DiscountSchema.findById(id);
    return res
      .status(200)
      .json({ success: true, message: "Success", discount: discount });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};

const createDiscount = async (req, res) => {
  const data = req.body;
  try {
    const result = await DiscountSchema.create({ ...data, email: "" });
    return res
      .status(200)
      .json({ success: true, message: "Success!", data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};

const createDiscountEmail = async (req, res) => {
  const data = req.body;
  const { email } = data;
  try {
    if (!data?.email) {
      return res.status(200).json({
        statusCode: 200,
        message: "Email is not empty!",
        success: false,
      });
    }
    const discountCheck = await DiscountSchema.find({ email: email });
    if (discountCheck.length !== 0) {
      return res.status(400).json({
        statusCode: 400,
        message: "Email already used!!!",
        success: false,
      });
    }
    const discountId = `NEW_MEMBER${new Date().valueOf()}`;

    await sendMail({
      template: "discount",
      email: email,
      subject: "Welcome Aboard! Enjoy 50% Off Your First Order!",
      templateVars: { discountId: discountId, urlWeb: process.env.URL_CLIENT },
    });

    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     host: "smtp.ethereal.email",
    //     port: 587,
    //     secure: false,
    //     auth: {
    //         user: process.env.USER_EMAIL,
    //         pass: process.env.PASSWORD_EMAIL
    //     }
    // })
    // (<%= name %>)
    // const mailOptions = {
    //     form: process.env.USER_EMAIL,
    //     to: email,
    //     subject: 'Discount for you <3!!!!',
    //     html: `${discountId}`
    // }

    // transporter.sendMail(mailOptions, function(error, info) {
    //     if(error){
    //         return res.status(500).json({error});
    //     }else{
    //         return res.status(200).json({msg: info.response })
    //     }
    // })

    const result = await DiscountSchema.create({
      idDiscount: discountId,
      valueDiscount: "50%",
      amountUse: 1,
      email: email,
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Success!",
      data: result,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong" });
  }
};

const getDiscountWithCode = async (req, res) => {
  const { discountCode } = req.params;
  console.log("discountCode", discountCode);
  try {
    const discount = await DiscountSchema.find({ idDiscount: discountCode });
    console.log("discount", discount);
    if (discount.length === 0) {
      return res
        .status(400)
        .json({ statusCode: 400, msg: "Discount is not existed!" });
    }
    return res
      .status(200)
      .json({ statusCode: 200, msg: "Success!", data: discount[0] });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const checkDiscountCode = async (req, res) => {
  const { discountCode } = req.body;
  try {
    const discount = await DiscountSchema.findOne({ idDiscount: discountCode });
    if (!discount) {
      return res
        .status(404)
        .json({ success: false, message: "Discount is not existed!" });
    }
    if (discount.amountUse === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Discount code has expired" });
    }
    return res.status(200).json({
      success: true,
      message: "Apply discount code success!",
      discount: discount,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong" });
  }
};

const updateDiscount = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    await DiscountSchema.findByIdAndUpdate(id, data);
    return res
      .status(200)
      .json({ success: true, message: "Update successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};

const deleteMultiDiscount = async (req, res) => {
  const { ids } = req.query;
  try {
    await DiscountSchema.remove({ _id: { $in: ids } });
    return res
      .status(200)
      .json({ success: true, message: "Delete successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};

module.exports = {
  getAllDiscount,
  getDiscountId,
  createDiscount,
  createDiscountEmail,
  getDiscountWithCode,
  checkDiscountCode,
  updateDiscount,
  deleteMultiDiscount,
};
