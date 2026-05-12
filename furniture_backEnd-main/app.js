const express = require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser')
const path = require('path');
require('dotenv').config()
const app = express()
const port = process.env.PORT ||8080;
//! Router
const users = require('./routes/user');
const admin = require('./routes/admin');
const product = require('./routes/product');
const order = require('./routes/order');
const discount = require('./routes/discount');
const dashboard = require('./routes/dashboard');
const statistic = require('./routes/statistic');
const vnPay =  require('./routes/vnPay');

const notFound = require('./middleware/not-found')
const connectDB = require('./db/connect');
const { requireAuth } = require('./middleware/authMiddleware');
const upload = require('./middleware/multer')
const Image = require('./models/Image')
const fs = require('fs');
const multer = require('multer');
// middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static('public/photos'))
app.use(express.static('public/imgs'))
app.use(express.json())
app.use(cookieParser())
// app.use(multer().none())
app.use(express.static('public'))
app.use(cors({
    origin:"*",
    credentials: true,
}))
// console.log('path',path.join(__dirname, 'uploads'));
// routes
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use('/api/v1/users',users)
app.use('/api/v1/admin',admin)
app.use('/api/v1/products',product)
app.use('/api/v1/order',order)
app.use('/api/v1/discount',discount);
app.use('/api/v1/statistic',statistic);
app.use('/api/v1/dashboard', dashboard);
app.use('/api/v1/vnPay',vnPay);



app.use('*',notFound)



const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port,() => {
            console.log(`Server is listening on port ${port}`);
        })
    } catch (error) {
        console.log(error);
    }
}



start();