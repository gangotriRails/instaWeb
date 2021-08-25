const authChecker = require("../middleware/auth-checker");
const couch = require('../controllers/couch');
const UserController = require("../controllers/user");
const express = require("express");
const router = express.Router();

module.exports = router;