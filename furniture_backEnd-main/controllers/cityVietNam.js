const CityVietNam = require("../models/CityVietNam");
const WardVietNam = require("../models/Ward");

const getAllCity = async (req,res) => {
    try {
        return res.status(200).json({statusCode: 200, msg: 'Success!'})
    } catch (error) {
        return res.status(500).json({error})
    }
}

const createCity = async (req,res) => {
    console.log(req.body, 'hoatlaBody');
    try {
        return res.status(200).json({statusCode: 200, msg: 'Success!'})
    } catch (error) {
        return res.status(500).json({error})
    }
}

const getAllWards = async (req, res) => {
    try {
        return res.status(200).json({statusCode: 200, msg: 'Success!'})
    } catch (error) {
        return res.status(500).json({error})
    }
}

const createWard  = async (req, res) => {
    const data = req.body;
    try {
        const result = await WardVietNam.create(data)
        return res.status(200).json({statusCode: 200, msg: 'Success!', data: result})
    } catch (error) {
        return res.status(500).json({error})
    }
}

module.exports = {
    getAllCity,
    createCity,
    getAllWards,
    createWard
}