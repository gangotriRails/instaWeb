const express = require("express");
const authChecker = require("../middleware/auth-checker");
const couch = require('../controllers/couch');


const UserController = require("../controllers/user");


const router = express.Router();

router.post("/signup", UserController.createUser);

router.post("/login", UserController.userLogin);

module.exports = router;
