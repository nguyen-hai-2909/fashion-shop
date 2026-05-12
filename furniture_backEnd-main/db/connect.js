const mongoose = require('mongoose')


const connectDB = (url) => {
    console.log('Connect is successful');
    return mongoose
        .connect(url)
        .then(() => console.log('db connect successful!!!'))
        .catch((e) => console.log(e))
}

module.exports = connectDB

    