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

router.post("",authChecker,multer({ storage: storage, fileFilter: fileFilter }).single("image"),(req, res, next) => {
    console.log("post to edit");
    editingPassword = req.body.password;
    console.log("editing password :",editingPassword);
    editingName = req.body.userName;
    console.log("editingName :",editingName);
    editingEmail = req.body.email;
    console.log("editing email :",editingEmail);
    bio = req.body.bio;
    console.log("bio :",bio);
    phone = req.body.phoneNumber;
    console.log("phone : ",phone);
    gender = req.body.gender;
    console.log("gender : ",gender);
    editingurl = req.body.url;
    // console.log("url :", editingurl);
    resultId = "";
    couch.findUser("_users", editingName).then( (response) => {
       console.log("user find",response);
       if (response.statusCode == 404) {
                 // console.log("User not found");
                 res.status(500).json({
                   message: "editing  failed!!!"
                 });
               } else {
                 console.log("user already exists");
                  couch.getAllDocsMetaData("_users").then( (result) => {
                   if (result.rows.length > 0) {
                     for (let i = 0; i < result.rows.length; i++) {
                         matchID = "org.couchdb.user:"+ editingName;
                         if( matchID == result.rows[i].id){ 
                       resultId = result.rows[i].id;
                       // console.log("resultId", resultId)
                   }
                     }
                     couch.findById("_users", resultId).then((response) => {
                      resetPasswordUserInfo = response.documents.docs[0];
                      // console.log("respose in userserr", response.documents.docs[0]);
                       if(editingEmail != ""){
                         console.log("email is not empty")
                       resetPasswordUserInfo["email"] = editingEmail;
                       }
                       if(bio != 'undefined'){ 
                       resetPasswordUserInfo["bio"] = bio;
                      }
                      if(phone != ""){
                       resetPasswordUserInfo["phone"] = phone;
                      }
                      if(gender != ""){ 
                       resetPasswordUserInfo["gender"] = gender;
                      }
                       resetPasswordUserInfo["profile"] = editingurl;
                       if(editingPassword != ""){ 
                       delete resetPasswordUserInfo.salt;
                       delete resetPasswordUserInfo.password_sha;
                       resetPasswordUserInfo["password"] = editingPassword;
                      }
                        console.log("resetPassword : ",resetPasswordUserInfo)
                        couch.insertDocument("_users", resetPasswordUserInfo).then((result) => {
                         // console.log("editing Document result", result);
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
                       });
                       
                     }).catch((err) => {
                       console.log(err);
                     });
                   }
               }).catch((err) => {
                   console.log(err);
                 });
                 
               }
 
     }).catch((err) => {
       console.log("err :", err);
     })
})

module.exports = router;