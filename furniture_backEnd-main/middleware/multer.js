const multer = require('multer');

// set storage imgs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,'public/photos')
    },
    filename: (req,file,cb) => {
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
})

module.exports = store = multer({ storage : storage })