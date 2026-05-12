const jwt = require("jsonwebtoken");
require("dotenv").config();

const requireAuth = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.split(" ")[1];
  res.locals.tokenDestroy = token;
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
      if (err) {
        // console.log('err',err.message);
        return res
          .status(404)
          .json({ statusCode: 404, success: false, message: err.message });
        // res.redirect('/login');
      } else {
        res.locals.token = decodedToken;
        next();
      }
    });
  } else {
    return res
      .status(404)
      .json({
        statusCode: 404,
        success: false,
        message: "Session has expired!",
      });
  }
};

module.exports = { requireAuth };
