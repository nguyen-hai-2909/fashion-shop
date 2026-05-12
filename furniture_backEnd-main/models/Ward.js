const mongoose = require('mongoose');

const WardSchema = new mongoose.Schema({
    id: {
        type: String,
        required: [true, 'id must provided'],
        unique: [true, 'id must unique!!!']
    },
    name: {
        type: String,
        required: [true, 'name must provided']
    },
    idDistrict: {
        type: String,
        required: [true, 'idDistrict must provided']
    }
})

module.exports = mongoose.model('Ward',WardSchema)