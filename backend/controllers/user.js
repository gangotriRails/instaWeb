const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var crypto = require('crypto');

const couch = require("./couch");

// User Login
exports.userLogin = async (req, res, next) => {
  userEmail = req.body.email;
  console.log("userEmail :",userEmail)
  password = req.body.password;
  let userInfo;
  await couch.authenticateUser(userEmail, password).then(async (status) => {
    console.log("status in auth checher :",status)
    if(status == true) {
      await couch.findUser("_users",userEmail).then(async (response) => {
        if (response.statusCode == 404) {
          return res.status(401).json({
            message: "Invalid credentials"
          });
        } else {
          if (response.documents.docs.length == 1) {
            userInfo = response.documents.docs[0];
              const token = jwt.sign(
                { email: userInfo.email, userId: userInfo._id},
                process.env.JWT_KEY,
                { expiresIn: "365d" }
              );
              console.log("Sending login successful response");
              if (process.env.COUCH_DB_PROVIDER == "IBM_CLOUDANT") {
                couchDbAdminUrl = "https://" + encodeURIComponent(userInfo.name) + ":" + encodeURIComponent(password) + "@" + process.env.COUCH_DB_HOST;
              } else {
                couchDbAdminUrl = "http://" + encodeURIComponent(userInfo.name) + ":" + encodeURIComponent(password) + "@" + process.env.COUCH_DB_HOST;
              }
              res.status(200).json({
                token: token,
              });
          }
        }
      });
    } else {
      console.log("CouchDb Authentication failed");
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }
  }).catch(err => {
    console.log("error while authenticating user");
    return res.status(401).json({
      message: "Invalid credentials"
    });
  });
}

// User Creation
exports.createUser = async (req, res, next) => {
  await couch.findUser("_users",req.body.email).then(async (response) => {
    console.log("Got Output from Cloudant find function on createUser");
    if (response.statusCode == 404) {
      console.log("User not found");
      var id = "org.couchdb.user:"+req.body.email;
      var userIdHash = await crypto.createHash('sha1').update(req.body.email).digest('hex');
      
      const clouadnt_user = {
        _id: id,
        userId: userIdHash,
        name: req.body.email,
        roles:["user"],
        fullName:req.body.fullName,
        userName:req.body.userName,
        profile:req.body.profile,
        bio:null,
        phone:null,
        gender:null,
        password: req.body.password,
        password_scheme: 'simple',
        type: "user"
      };
      console.log("cloudant : ",clouadnt_user)
      couch.insertDocument('_users',clouadnt_user).then((result) => {
        if (result.ok == true) {
          res.status(201).json({
            message: "User created!"
          });
        } else {
          res.status(500).json({
            message: "Unable to create user"
          });
        }
      });
    } else {
      console.log("Please use different mail id as it already exists");
      res.status(500).json({
        message: "User Id already exists. Please use different Id"
      });
    }
  });
}

