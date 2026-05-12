const mongoose = require('mongoose');
const {isEmail} = require('validator')
const AdminSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'user name must provided'],
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: [true,'Phone number must provided'],
        trim: true,
        unique:[true,'phone number is exist'],
        maxlength: [10,'phone number can not be more than10 characters']
    },
    name: {
        type:String,
        required: [true,'Name must provided!'],
        trim: true,
        maxlength: [30,'name can not more than 30 characters']
    },
    address: {
        type: String,
        trim: true,
        default:''
    },
    password: {
        type: String,
        required: [true, 'password must provided'],
        trim: true,
        minlength: [6, 'password need more than 6 characters']
    },
    email: {
        type: String,
        required: [true, 'email must provided'],
        trim: true,
        maxlength: [30, 'email can not be more than 30 characters'],
        validate: [isEmail,'Pls enter a valid email!']
    }
})

module.exports = mongoose.model('Admin',AdminSchema)