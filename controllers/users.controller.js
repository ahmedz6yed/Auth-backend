const User = require("../models/User.js");
const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").exec();
  if (!users) {
    return res.status(204).json({ message: "No users found" });
  }
  res.json(users);
};

module.exports = {
  getAllUsers,
};
