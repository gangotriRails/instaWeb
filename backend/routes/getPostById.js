const authChecker = require("../middleware/auth-checker");
const couch = require('../controllers/couch');
const UserController = require("../controllers/user");
const express = require("express");
const router = express.Router();
const multer = require('multer');

  router.get("", authChecker, (req, res, next) => {
    var userId = req.query.postId
    console.log("userId ; ",userId)
    var postList = [];
    couch.checkDatabase('post').then(async (result) => {
      if (result) {
        await couch.findById('post', userId).then(async (result) => {
            postList.push(result.documents.docs[0])
            console.log("respose in userserr",postList);
          res.status(200).json({
            postList: postList
          });
        }).catch((err) => {
          res.status(200).json({
            postList: "null"
          });
        })
      }
    }).catch((err) => {
    })
  });
  
module.exports = router;
