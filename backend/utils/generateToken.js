// utils/generateToken.js
import jwt from 'jsonwebtoken';

const generateToken = (id) => { // You pass user._id here
  // The fix is inside the curly braces {}
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;