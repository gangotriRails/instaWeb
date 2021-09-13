const authChecker = require("../middleware/auth-checker");
const couch = require('../controllers/couch');
const UserController = require("../controllers/user");
const express = require("express");
const router = express.Router();
const multer = require('multer');
const { response } = require("express");
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
    const image_wav_dir = './images/' + req.query.userName + '/'
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


router.post("", authChecker, multer({ storage: storage, fileFilter: fileFilter }).single("image"), (req, res, next) => {
  userName = req.body.userName;
  profileUrl = req.body.profileImg;
  postUrl = req.body.postImg;
  timestamp = req.body.timestamp
  caption = req.body.caption
  couch.findUser("_users", userName).then(async (response) => {
    // console.log("response for user find", response);
    if (response.statusCode == 404) {
      // console.log("User not found. Sending 404 response");
      return res.status(401).json({
        message: "User cant post because user not found"
      });
    } else {
      await couch.checkDatabase("post").then(async (dbStatus) => {
        // console.log("checking db", dbStatus)
        const postInfo = {
          userId: "##########" + userName,
          name: req.body.userName,
          profileUrl: profileUrl,
          postUrl: postUrl,
          caption: caption,
          like: [],
          comments: [],
          timestamp: timestamp
        };
        console.log("post base 64",postUrl)
        if (!dbStatus) {
          dbCreationStatus = await couch.createDatabase("post").then(status => {
            // console.log("database creation successful", status);
            if (status) {
              couch.insertDocument('post', postInfo).then(async (result) => {
                if (result.ok == true) {
                  res.status(201).json({
                    message: "posted succeffully!",
                    _id: result.id
                  });
                } else {
                  res.status(500).json({
                    message: "Unable to post"
                  });
                }
              }).catch((error) => {
                // console.log("error in insertion", error);
              });
              securityInfo = {};
              securityInfo[userName] = ['_admin', '_replicator', '_reader', '_writer'];
              couch.setDbSecurity('post', userName).then(async (status) => {
                // console.log("permission granted successfully for userdb", status);
              }).catch((err) => {
                // console.log("error while granting permission for userdb", err);
              });
            }
            // return status;
          }).catch((err) => {
            // console.log("error in creating db", err);
          });
        } else {
          couch.insertDocument('post', postInfo).then(async (result) => {
            if (result.ok == true) {
              // console.log(result);
              res.status(201).json({
                message: "posted succeffully!",
                _id: result.id
              });
            } else {
              res.status(500).json({
                message: "Unable to post"
              });
            }
          }).catch((error) => {
            // console.log("error in insertion", error);
          })
        }
      }).catch((err) => {
        // console.log("error in check db ,", err);
      })
    }
  }).catch((err) => {
    // console.log(err)
  })
});

router.get("", authChecker, (req, res, next) => {
  var postCount = req.query.postCount;
  console.log("getting posts",postCount);

  var postList = [];
  var loadedPost = []
  couch.checkDatabase('post').then(async (result) => {
    if (result) {
      await couch.getAllDocs('post').then(async (result) => {
        for (i = 0; i < result.rows.length; i++) {
          postList.push(result.rows[i].doc);
        }
        loadedPost = postList.slice(0,postCount)
        console.log("posts Lists", postList.length)
        console.log("loadedPost Lists ::::::::::", loadedPost.length)
        res.status(200).json({
          postList: loadedPost
        });
      }).catch((err) => {
        // console.log("error in get all docs", err);
        res.status(200).json({
          postList: "null"
        });
      })
    }
  }).catch((err) => {
    // console.log(err)
  })
})

router.put("", authChecker, (req, res, next) => {
  console.log("put request id", req.body.postId);
  // console.log("put request count", req.body.likesCount);
  if (req.body.hasOwnProperty('newComment')) {
    // console.log("newComment", req.body.newComment);
    // console.log("postId", req.body.postId);

    couch.checkDatabase('post').then(async (result) => {
      if (result) {
        await couch.findById('post', req.body.postId).then(async (response) => {
          // console.log("respose in fetched posts", response.documents.docs[0]);
          postInfo = response.documents.docs[0];
          postInfo.comments.push(req.body.newComment);
          await couch.insertDocument('post', postInfo).then((result) => {
            // console.log("insert comment Document result", result);
            if (result.ok == true) {
              // console.log("comment has been updated in post database");
              res.status(200).json({
                message: req.body.postId + "has been updated with comment successfully",
                updated: "Y"
              });
            } else {
              // console.log("Inserting comment to post failed");
              res.status(200).json({
                message: req.body.postId + "comment update failed",
                updated: "N"
              });
            }
          });
        }).catch((err) => {
          // console.log(err);
          res.status(200).json({
            message: req.body.postId + "comment update failed",
            updated: "N"
          });
        });
      }
    }).catch((err) => {
      // console.log("err ", err);
      res.status(200).json({
        message: req.body.postId + "update failed",
        updated: "N"
      });
    })
  } else {
    couch.checkDatabase('post').then(async (result) => {
      if (result) {
        await couch.findById('post', req.body.postId).then(async (response) => {
          console.log("respose in fetched posts", response.documents.docs[0]);
          console.log("lokkkeeeeeee",req.body.newLike)
          postInfo = response.documents.docs[0];
          postInfo.like = req.body.newLike;
          console.log("like",req.body.newLike);
          await couch.insertDocument('post', postInfo).then((result) => {
            console.log("insert page Document result", result);
            if (result.ok == true) {
              console.log("post document has been updated in post database");
              res.status(200).json({
                message: req.body.postId + "has been updated successfully",
                updated: "Y"
              });
            } else {
              console.log("Inserting post document to post failed");
              res.status(200).json({
                message: req.body.postId + "update failed",
                updated: "N"
              });
            }
          });
        }).catch((err) => {
          console.log(err);
          res.status(200).json({
            message: req.body.postId + "update failed",
            updated: "N"
          });
        });
      }
    }).catch((err) => {
      // console.log("err ", err);
      res.status(200).json({
        message: req.body.postId + "update failed",
        updated: "N"
      });
    })
  }
})

module.exports = router;