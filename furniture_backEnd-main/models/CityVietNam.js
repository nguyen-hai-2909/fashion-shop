const mongoose = require('mongoose');

const CityVietNamSchema = new mongoose.Schema({
    id: {
        type: String,
        required: [true, 'id must provided']
    },
    name: {
        type: String,
        required: [true, 'name must provided']
    },
    districts: [
        {
            id: {
                type: String,
                required: [true, 'id must provided']
            },
            name: {
                type: String,
                required: [true, 'name must provided']
            },
            wards: [
                {
                    id: {
                        type: String,
                        required: [true, 'id must provided']
                    },
                    name: {
                        type: String,
                        required: [true, 'name must provided']
                    },
                    level: {
                        type: String,
                        required: [true, 'level must provided']
                    }
                }
            ]
        }
    ]
})  

module.exports = mongoose.model('CityVietNam', CityVietNamSchema)