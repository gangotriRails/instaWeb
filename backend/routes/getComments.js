const express = require("express");
const authChecker = require("../middleware/auth-checker");
const couch = require('../controllers/couch');
const UserController = require("../controllers/user");
const router = express.Router();
router.get("", authChecker, (req, res, next) => { 
    var commentsList = [];
    couch.checkDatabase('post').then(async (result) => {
      if (result) {
        await couch.findById('post', req.query.postId).then(async (result) => {
            var postInfo = result.documents.docs[0]
            postInfo['comments'].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
            commentsList = postInfo['comments'].slice(0, req.query.count)
          res.status(200).json({
            commentsList: commentsList
          });
        }).catch((err) => {
          res.status(200).json({
            commentsList: "null"
          });
        })
      }
    }).catch((err) => {
    })
    });
    router.delete("", (req, res, next) => {
      console.log("req.query.commenId", req.query.commentId);
      console.log("req.query.postId", req.query.postId);

      // console.log("req.params.deletingId", req.params.deleteUser);
      const deletingId = req.query.postId
      console.log("deletingId", deletingId);
    
      couch.findById("post", deletingId).then((response) => {
        console.log("user find", response.documents.docs[0]);
        if (response.statusCode == 404) {
          console.log("User not found");
          res.status(500).json({
            message: "User Deletion failed"
          });
        } else {
          var postInfo = response.documents.docs[0];
          console.log("postInfo before :",postInfo['comments']);
      postInfo['comments'] = postInfo['comments'].filter(id => id.id != req.query.commentId);
      console.log("postInfo after :",postInfo['comments']);
      couch.insertDocument('post',postInfo).then(result => {
        if (result.ok == true) {
          res.status(201).json({
            message: "deletion succesfulll"
          });
        } else {
          res.status(500).json({
            message: "Unable to delete"
          });
        }
       
      }).catch(err => {
        console.log("err in inserting :",err)
        res.status(500).json({
          message: "Unable to delete"
        });
      })
     
         
          // console.log("user already exists", postInfo);
          // couch.deleteDocument("post", postInfo._id, postInfo._rev).then((response) => {
          //   console.log("response of deleting ", response)
          //   res.status(201).json({
          //     message: "deletion succesfulll"
          //   });
          // }).catch((err) => {
          //   console.log(err);
          // });
        }
      }).catch((err) => {
        console.log("err :", err);
        res.status(500).json({
          message: "User Deletion failed",
        });
      })    
    });
    
module.exports = router;
