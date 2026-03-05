require("dotenv").config();
const express = require("express");
const connectDB = require("./config/dbconn");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const corsOptions = require("./config/corsOptions");
connectDB();
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", require("./routes/root"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.all("/{*splat}", (req, res) => {
  if (req.accepts("html")) {
    res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.status(404).json({ message: "404 Not Found" });
  } else {
    res.status(404).type("txt").send("404 Not Found");
  }
});
mongoose.connection.on("open", () => {
  console.log("Mongoose connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});
