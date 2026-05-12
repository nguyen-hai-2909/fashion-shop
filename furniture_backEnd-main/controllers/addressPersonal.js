const AddressPersonalSchema = require('../models/AddressPersonal');

const getAllAddressPersonal = async (req,res) => {
    try {
        const listAddressPersonal = await AddressPersonalSchema.find();
        return res.status(200).json({statusCode: 200, msg: 'Success!', data: listAddressPersonal})
    } catch (error) {
        return res.status(500).json(error);
    }
}

const createAddressPersonal = async (req,res) => {
    const {id} = req.params;
    const data = req.body;
    try {
        const addressPersonalCreated = await AddressPersonalSchema.create({...data, idUser: id});
        if(addressPersonalCreated) {
            return res.status(200).json({statusCode: 200, msg: 'Create success!!!', data: addressPersonalCreated})
        }
    } catch (error) {
        return res.status(500).json(error);
    }
}

const getSingleAddressPersonal = async (req, res) => {
    const {id} = req.params;
    try {
        const listAddressPersonal = await AddressPersonalSchema.find({idUser: id});
        return res.status(200).json({statusCode: 200, msg: 'Success!', data: listAddressPersonal})
    } catch (error) {
        return res.status(500).json(error);
    }
}

const updateAddressPersonal = async (req, res) => {
    const {id: idAddress} = req.params;
    const data = req.body;
    try {
        const addressUser = await AddressPersonalSchema.findOneAndUpdate({_id: idAddress}, {...data});
        if(!addressUser){
            return res.status(400).json({statusCode: 400, msg: 'Address is not existed!'})
        }
        return res.status(200).json({statusCode: 200, msg: 'Updated successful!', data: addressUser})
    } catch (error) {
        return res.status(500).json(error);
    }
}

const deleteAddressPersonal = async (req,res) => {
    const {id: idAddress} = req.params;
    try {
        const addressUser = await AddressPersonalSchema.findOneAndDelete({_id: idAddress});
        if(!addressUser){
            return res.status(400).json({statusCode: 400, msg: 'address is not existed!'});
        }
        return res.status(200).json({statusCode: 200, msg: 'Delete successful!', data: addressUser})
    } catch (error) {
        return res.status(500).json(error);
    }
}



module.exports = {getAllAddressPersonal, getSingleAddressPersonal, updateAddressPersonal, deleteAddressPersonal, createAddressPersonal};