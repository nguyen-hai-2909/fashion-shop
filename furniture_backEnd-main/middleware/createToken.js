const jwt = require('jsonwebtoken')

const maxAge = '8h'
const createToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: maxAge
  });
};

module.exports = createToken