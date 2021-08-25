const express = require("express");
const authChecker = require("../middleware/auth-checker");
const couch = require('../controllers/couch');
const UserController = require("../controllers/user");
const router = express.Router();
console.log(authChecker)
router.post("",(req, res, next) => {
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
    console.log("url :", editingurl);
    resultId = "";
    couch.findUser("_users", editingName).then( (response) => {
       console.log("user find",response);
       if (response.statusCode == 404) {
                 console.log("User not found");
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
                       console.log("resultId", resultId)
                   }
                     }
                     couch.findById("_users", resultId).then((response) => {
                       console.log("respose in userserr", response.documents.docs[0]);
                       resetPasswordUserInfo = response.documents.docs[0];
                       resetPasswordUserInfo["email"] = editingEmail;
                       resetPasswordUserInfo["bio"] = bio;
                       resetPasswordUserInfo["phone"] = phone;
                       resetPasswordUserInfo["gender"] = gender;
                       resetPasswordUserInfo["profile"] = editingurl;
                       delete resetPasswordUserInfo.salt;
                       delete resetPasswordUserInfo.password_sha;
                       resetPasswordUserInfo["password"] = editingPassword;
                        console.log("resetPassword : ",resetPasswordUserInfo)
                        couch.insertDocument("_users", resetPasswordUserInfo).then((result) => {
                         console.log("editing Document result", result);
                         if (result.ok == true) {
                           
                           console.log("editing successfull");
                           res.status(201).json({
                             message: "editing successfull"
                           });
                         } else {
                           console.log("editing users failed");
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