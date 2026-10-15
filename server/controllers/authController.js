const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const generateToken = require('../utils/generateToken');

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    return success(res, { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } else {
    return error(res, 'Invalid credentials', 401);
  }
});

exports.getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    return error(res, 'User not found', 401);
  }
  return success(res, req.user);
});

exports.logout = asyncHandler(async (req, res) => {
  return success(res, null, 'Logged out successfully');
});
