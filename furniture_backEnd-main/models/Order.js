const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    idUser: {
      type: String,
      required: [true, "idUser is required!"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name employee is required!"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required!"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required!"],
      trim: true,
    },
    note: {
      type: String,
      default: "",
    },
    paymentType: {
      type: String,
      default: "COD",
    },
    products: [
      {
        idProduct: {
          type: String,
          required: [true, "idProduct is required!"],
          trim: true,
        },
        amount: {
          type: Number,
          required: [true, "amount product is required!"],
        },
        color: {
          type: String,
          required: [true, "color product is required!"],
          trim: true,
        },
        price: {
          type: Number,
          required: [true, "price product is required!"],
        },
        img: {
          type: String,
          required: [true, "img is required!"],
        },
        name: {
          type: String,
          required: [true, "name product is required!"],
        },
      },
    ],
    discount: {
      discountCode: {
        type: String,
        default: "",
      },
      discountValue: {
        type: String,
        default: 0,
      },
    },
    totalDiscount: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: [true, "total price order is required!"],
    },
    totalCurrentPrice: {
      // total price when apply discount
      type: Number,
      required: [true, "total price product is required!"],
    },
    status: {
      type: String,
      default: "01",
    },
    paymentStatus: {
      type: String,
      default: "01",
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
