const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const foundUser = await User.findOne({ email }).exec();
  if (foundUser) {
    return res.status(409).json({ message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });
  const accessToken = jwt.sign(
    {
      userInfo: {
        id: newUser._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    {
      userInfo: {
        id: newUser._id,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    qualified: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(201).json({
    accessToken,
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
  });
};
//Login,

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const foundUser = await User.findOne({ email }).exec();
  if (!foundUser) {
    return res.status(401).json({ message: "user does not exist" });
  }
  const match = await bcrypt.compare(password, foundUser.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid password" });
  }
  const accessToken = jwt.sign(
    {
      userInfo: {
        id: foundUser._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    {
      userInfo: {
        id: foundUser._id,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    qualified: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    accessToken,
    email: foundUser.email,
  });
};
const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const foundUser = await User.findById(decoded.userInfo.id).exec();
      if (!foundUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const accessToken = jwt.sign(
        {
          userInfo: {
            id: foundUser._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" },
      );
      res.status(200).json({ accessToken });
    },
  );
};
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(204).json({ message: "No content" });
  }
  res.clearCookie("jwt", { httpOnly: true, secure: true, qualified: "None" });
  res.status(200).json({ message: "Logged out successfully" });
};
module.exports = {
  register,
  login,
  refresh,
  logout,
};
