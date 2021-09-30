const express = require("express");
const authChecker = require("../middleware/auth-checker");
const couch = require('../controllers/couch');
const UserController = require("../controllers/user");
const router = express.Router();
// // console.log(authChecker)
const multer = require('multer');
const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/tiff": "tif",
    "image/bmp": "bmp"
  };
  var invalid = "";
const fileFilter = (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    if (isValid) {
      invalid = ""
      cb(null, true);
    } else {
      invalid = "And invalid file types were skipped. "
      cb(null, false);
    }
  }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const image_wav_dir = './images/profile' + req.query.userName + '/'
      var fs = require('fs');
      let dir = image_wav_dir;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
  
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const name = file.originalname;
      cb(null, name);
    }
  });
  router.put("",authChecker,multer({ storage: storage, fileFilter: fileFilter }).single("image"),(req, res, next) => {
    postId = req.body.id;
    console.log("post to edit",req.body.postImg);

    couch.checkDatabase('post').then(async (result) => {
      if (result) {
        await couch.findById('post', postId).then(async (result) => {
          var postInfo = result.documents.docs[0]
          postInfo["postUrl"] = req.body.postImg;
          if(req.body.caption != ""){
            console.log("email is not empty")
          postInfo["caption"] = req.body.caption;

          }
          
          var today = new Date();
          var date = String(today.getDate()).padStart(2, '0') + '-' + String(today.getMonth() + 1).padStart(2, '0')
            + '-' + today.getFullYear();
          var time = new Date();
          var currentTime = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
          postInfo["date"] = date;
          postInfo["time"] = currentTime;
          console.log("edited post info ::",postInfo)
            couch.insertDocument("post", postInfo).then((result) => {
              console.log("editing Document result", result);
              if (result.ok == true) {
                console.log("editing successfull");
                res.status(201).json({
                  message: "editing successfull"
                });
              } else {
                console.log("editing users failed");
                res.status(200).json({
                 message: "editing failed",
                 
               });
              }
            }).catch( err => {
              res.status(200).json({
                message: "editing failed",
              });
            })
        }).catch((err) => {
          res.status(200).json({
            message: "editing failed",
          });
        })
      }
    }).catch((err) => {
    })
})
module.exports = router;
