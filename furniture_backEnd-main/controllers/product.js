const mongoose = require("mongoose");
const Product = require("../models/Product");
const Image = require("../models/Image");
const fs = require("fs");
const _ = require("lodash");
const getDirnameImg = require("../middleware/getDirnameImg");
require("dotenv").config();

const createProduct = async (req, res) => {
  const data = req.body;
  try {
    const product = await Product.create({
      ...data,
      images: JSON.parse(data.images),
      stock: JSON.parse(data.stock),
    });
    return res.status(200).json({
      success: true,
      message: "Create product success🎉!",
      data: product,
    });
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};

const getAllProducts = async (req, res) => {
  const { name, sort, category, company, color, price, shipping } = req.query;
  try {
    const products = await Product.find();
    let listProduct = products;
    if (name) {
      listProduct = listProduct.filter((el) => {
        return el?.name?.toLowerCase().indexOf(name.toLowerCase()) !== -1;
      });
    }
    if (category) {
      listProduct = listProduct.filter((el, index) => {
        return el?.category === category;
      });
    }
    if (company) {
      listProduct = listProduct.filter((el) => {
        return el?.company.toLowerCase().indexOf(company.toLowerCase()) !== -1;
      });
    }
    if (price) {
      listProduct = listProduct.filter((el) => {
        return el?.price <= parseInt(price);
      });
    }
    if (color) {
      listProduct = listProduct.filter((el) => {
        const isCheck = el.stock.some((el) => el.color === color);
        if (isCheck) {
          return el;
        }
      });
    }
    if (listProduct.length === 0) {
      return res.status(200).json({
        statusCode: 204,
        msg: "Do not have products!!!",
        products: [],
      });
    }

    if (sort === "priceLowest") {
      listProduct = listProduct.sort((a, b) => a.price - b.price);
    }
    if (sort === "priceHighest") {
      listProduct = listProduct.sort((a, b) => b.price - a.price);
    }
    if (sort === "nameA") {
      listProduct = listProduct.sort((a, b) => {
        if (a.name < b.name) return -1;
        return 0;
      });
    }
    if (sort === "nameZ") {
      listProduct = listProduct.sort((a, b) => {
        if (a.name > b.name) return -1;
        return 0;
      });
    }

    return res.status(200).json({ msg: "success", products: listProduct });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const getSingleProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product is not exist!" });
    }
    return res.status(200).json({ success: true, message: "success", product });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const dirnameImg = getDirnameImg();
  try {
    const productData = await Product.findByIdAndRemove(id);
    const imgPaths = productData?.images.map((el) => {
      const path = el.split("/");
      return path[path.length - 1];
    });
    if (!productData) {
      return res.status(404).json({ errCode: 1, msg: "Product is not exist!" });
    }
    if (imgPaths) {
      imgPaths?.forEach((el) => {
        fs.unlinkSync(`${dirnameImg}${el}`);
        console.log(`${dirnameImg}${el}`);
      });
    }
    return res.status(200).json({ msg: "Delete successful!", productData });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const updateProduct = async (req, res) => {
  const {id} = req.params;
  const data = req.body;
  try {
    const productCheck = await Product.findById(id);
    if (!productCheck) {
      return res
        .status(400)
        .json({ success: false, message: "Product is not existed!!!" });
    }

    await Product.findByIdAndUpdate(id, {
      ...data,
      images: JSON.parse(data.images),
      stock: JSON.parse(data.stock),
    })
    return res
      .status(200)
      .json({ success: true, message: 'Update successfully!' });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!", error });
  }
};

const deleteMultiProduct = async (req, res) => {
  const { ids } = req.query;
  try {
    await Product.remove({ _id: { $in: [...ids] } });
    return res
      .status(200)
      .json({ success: true, message: "Remove successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ error, success: false, message: "Something went wrong!" });
  }
};
module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  deleteProduct,
  updateProduct,
  deleteMultiProduct,
};
