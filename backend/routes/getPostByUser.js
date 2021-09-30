const authChecker = require("../middleware/auth-checker");
const couch = require('../controllers/couch');
const UserController = require("../controllers/user");
const express = require("express");
const router = express.Router();
const multer = require('multer');

router.get("", authChecker, (req, res, next) => {
    var postCount = req.query.postCount;
    var userId = req.query.userId
    console.log("getting posts",postCount);
  
    var postList = [];
    var loadedPost = []
    couch.checkDatabase('post').then(async (result) => {
      if (result) {
        await couch.getAllDocs('post').then(async (result) => {
          for (let i = 0;i<result.rows.length; i++) {
            delete result.rows[i].doc["_rev"];
            if(result.rows[i].doc['email'] == userId){ 
            postList.push(result.rows[i].doc);
        }
          }
        postList.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
          loadedPost = postList.slice(0,postCount)
          console.log("posts Lists", postList.length)
          console.log("loadedPost Lists ::::::::::", loadedPost.length)
          res.status(200).json({
            postList: loadedPost
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
