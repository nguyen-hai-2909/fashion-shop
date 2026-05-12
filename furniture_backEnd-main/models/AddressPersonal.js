const mongoose = require('mongoose');

const AddressPersonalSchema = new mongoose.Schema({
    idUser: {
        type: String,
        require: [true, 'idUser must provided'],
        trim: true
    },
    name: {
        type: String,
        require: [true, 'name must be provided'],
        trim: true
    },
    phoneNumber: {
        type: String,
        require: [true, 'phoneNumber must be provided'],
        trim: true
    },
    address: {
        type: String,
        require: [true, 'address must be provided'],
        trim: true
    }
})

module.exports = mongoose.model('AddressPersonal', AddressPersonalSchema)