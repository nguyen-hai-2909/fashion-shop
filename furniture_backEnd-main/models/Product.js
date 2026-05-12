const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Name product must provided"],
    // trim: true,
    // unique: [true, "Product is existed!"],
  },
  price: {
    type: Number,
    required: [true, "Price product must provided"],
    trim: true,
  },
  images: [
    {
      uid: {
        type: String,
      },
      name: {
        type: String,
      },
      url: {
        type: String,
      },
      status: {
        type: String,
      },
    },
  ],
  // stock:{
  //     type: Number,
  //     trim: true,
  //     default: 0
  // },
  // reviews: {
  //     type: Number,
  //     trim:true,
  //     default: 0
  // },
  // stars: {
  //     type: Number,
  //     trim: true,
  //     default: 3,
  //     max: [5,"Stars cann't be higher than 5"]
  // },
  stock: [
    {
      amount: {
        type: Number,
        default: 0,
      },
      color: {
        type: String,
        trim: true,
      },
    },
  ],
  // colors:{
  //     type: Array,
  //     // required: [true,'Colors product must provided'],
  //     default: ['#000','#fff']
  // },
  company: {
    type: String,
    required: [true, "Company product must provided"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description product must provided"],
    // trim: true
  },
  category: {
    type: String,
    required: [true, "Category product must provided"],
  },
  // shipping:{
  //     type:Boolean,
  //     default: false
  // }
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", ProductSchema);
