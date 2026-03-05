const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller.js");
const verifyJWT = require("../middlewares/vertifyjwt.js");
router.use(verifyJWT);
router.route("/").get(usersController.getAllUsers);

module.exports = router;
