const mongoose = require("mongoose");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const createToken = require("../middleware/createToken");
const { sendMail } = require("../middleware/sendMail");

const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);

const getAllUsers = async (req, res) => {
  const { name, phoneNumber, email } = req.query;
  try {
    let users = await User.find();
    if (!users) {
      return res.status(200).json({ errCode: 1, msg: "User is empty!!" });
    }
    users = users.filter((el) => {
      return el?.name?.toLowerCase().indexOf(name.toLowerCase()) !== -1;
    });
    users = users.filter((el) => {
      return el?.phoneNumber?.indexOf(phoneNumber) !== -1;
    });
    users = users.filter((el) => {
      return (
        el?.email?.toLowerCase().toLowerCase().indexOf(email.toLowerCase()) !==
        -1
      );
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ errCode: 5, msg: "Error sever!!", error });
  }
};
const createUser = async (req, res) => {
  const data = req.body;
  try {
    const user = await User.create({
      ...data,
      password:
        data.password.length > 5
          ? bcrypt.hashSync(data.password, salt)
          : data.password,
    });
    return res
      .status(200)
      .json({ success: true, message: "Create account successfully🎉🎉🎉!" });
  } catch (error) {
    if (error?.keyPattern?.phoneNumber === 1) {
      return res
        .status(400)
        .json({ success: false, message: "Your phone number is existed" });
    } else if (error?.keyPattern?.email === 1) {
      return res
        .status(400)
        .json({ success: false, message: "Your email is existed" });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong!", error });
    }
  }
};
const getSingleUser = async (req, res) => {
  const { id: userID } = req.params;
  try {
    const user = await User.findById(userID);
    if (!user) {
      return res.status(200).json({ errCode: 1, msg: "user is not exist!!!" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
};
const updateUser = async (req, res) => {
  const { id: userID } = req.params;
  const data = req.body;
  try {
    const user = await User.findByIdAndUpdate(userID, {
      ...data,
      password:
        data.password.length > 5
          ? bcrypt.hashSync(data.password, salt)
          : data.password,
    });
    if (!user) {
      return res.status(200).json({ errCode: 1, msg: "user is not exist!!!" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
};
const deleteUser = async (req, res) => {
  const { id: userID } = req.params;
  try {
    const user = await User.findByIdAndRemove(userID);
    if (!user) {
      return res.status(404).json({ errCode: 1, msg: "user is not exist!!!" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const loginUser = async (req, res) => {
  const data = req.body;
  try {
    let user = await User.findOne({ phoneNumber: data.phoneNumber }).exec();

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Email is not existed!" });
    }
    if (!bcrypt.compareSync(data.password, user.password)) {
      return res
        .status(401)
        .json({ success: false, message: "Password is not true!" });
    }

    const token = createToken(user._id);
    const { password, ...rest } = user._doc;
    return res.status(200).json({
      success: true,
      user: { ...rest },
      accessToken: token,
      message: "Welcome back 🎉🎉🎉!!!",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

const sendMailUser = async (req, res) => {
  const { email } = req.body;
  try {
    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    // localStorage.setItem('token-reset-password', token)
    let user = await User.findOne({ email: email }).exec();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email is not existed!" });
    }
    await sendMail({
      template: "forgotPassword",
      email: email,
      subject: "Reset Password!!!",
      templateVars: {
        urlWeb: `${process.env.URL_CLIENT_RESET_PASS}?token=${token}`,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Successfully _ Pls check your EMAIL!!!",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong" });
  }
};

const resetPassword = async (req, res) => {
  const { email } = res.locals.token;
  const { password } = req.body;
  try {
    await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          password:
            password.length > 5 ? bcrypt.hashSync(password, salt) : password,
        },
      }
    );
    return res.status(200).json({ success: true, message: "Success!" });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};

const editUser = async (req, res) => {
  const { id: userID } = res.locals.token;
  const { name, address } = req.body;
  try {
    const user = await User.findByIdAndUpdate(userID, {
      name: name,
      address: address,
    });
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User is not found!!!",
        success: false,
      });
    }
    const userUpdated = await User.findById(userID);
    const { password, ...rest } = userUpdated._doc;
    return res.status(200).json({
      statusCode: 200,
      message: "Updated successful!",
      user: { ...rest },
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong" });
  }
};

const changePassword = async (req, res) => {
  const { id: userID } = res.locals.token;
  const { newPassword } = req.body;
  try {
    if (newPassword.length < 6) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Password must more than 6 characters!",
      });
    }
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: false,
        message: "User is not found!!!",
      });
    }
    await User.findByIdAndUpdate(userID, {
      password:
        newPassword.length > 5
          ? bcrypt.hashSync(newPassword, salt)
          : newPassword,
    });
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Update password user successful!",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong" });
  }
};

const getProfileUser = async (req, res) => {
  const { id: userID } = res.locals.token;
  try {
    const user = await User.findById(userID);
    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "user is not exist!!!" });
    }
    const { password, ...rest } = user._doc;
    return res
      .status(200)
      .json({ success: true, user: { ...rest }, message: "Success!" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getSingleUser,
  updateUser,
  deleteUser,
  loginUser,
  sendMailUser,
  resetPassword,
  editUser,
  changePassword,
  getProfileUser,
};
