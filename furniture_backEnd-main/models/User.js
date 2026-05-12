const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: [true, "phone number must provided"],
      trim: true,
      unique: [true, "phone number is exist"],
      maxlength: [10, "phone number can not be more than 10 characters"],
    },
    name: {
      type: String,
      required: [true, "name must provided"],
      trim: true,
      maxlength: [30, "name can not be more than 500 characters"],
    },
    password: {
      type: String,
      required: [true, "password must be provided"],
      trim: true,
      minlength: [6, "password need more than 6 characters"],
    },
    gender: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email must provided"],
      trim: true,
      unique: [true, "email is existed"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [50, "address can not be more than 50 characters"],
      default: "",
    },
    bank: {
      type: String,
      trim: true,
      default: "",
    },
    creditCardNumber: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
