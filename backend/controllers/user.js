const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var crypto = require('crypto');

const couch = require("./couch");

// User Login
exports.userLogin = async (req, res, next) => {
  userEmail = req.body.email;
  password = req.body.password;
  let userInfo,perUserDb;
  await couch.authenticateUser(userEmail, password).then(async (status) => {
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
                { email: userInfo.email, userId: userInfo.userId},
                process.env.JWT_KEY,
                { expiresIn: "365d" }
              );
              // console.log("Sending login successful response");
              if (process.env.COUCH_DB_PROVIDER == "IBM_CLOUDANT") {
                couchDbAdminUrl = "https://" + encodeURIComponent(userInfo.name) + ":" + encodeURIComponent(password) + "@" + process.env.COUCH_DB_HOST;
              } else {
                couchDbAdminUrl = "http://" + encodeURIComponent(userInfo.name) + ":" + encodeURIComponent(password) + "@" + process.env.COUCH_DB_HOST;
              }
              res.status(200).json({
                token: token,
                expiresIn: 31536000,
                userId: userInfo.userId,
                email: userInfo.email,
                fullName:userInfo.fullName,
                userName:userInfo.userName,
                profile:userInfo.profile,
                role: userInfo.roles,
                bio:userInfo.bio,
                phone:userInfo.phone,
                gender:userInfo.gender,
                dbUrl: couchDbAdminUrl,
                userDb: perUserDb,
                userDbKey: userInfo.name,
                userDbPwd: password
              });
          }
        }
      });
    } else {
      // console.log("CouchDb Authentication failed");
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }
  }).catch(err => {
    // console.log("error while authenticating user");
    return res.status(401).json({
      message: "Invalid credentials"
    });
  });
}

// User Creation
exports.createUser = async (req, res, next) => {
  console.log("entered createUser in user.js");
  await couch.findUser("_users",req.body.email).then(async (response) => {
    // console.log("Got Output from Cloudant find function on createUser");
    if (response.statusCode == 404) {
      // console.log("User not found");
      var id = "org.couchdb.user:"+ req.body.userName;
      var userIdHash = await crypto.createHash('sha1').update(req.body.email).digest('hex');
      const clouadnt_user = {
        _id: id,
        userId: userIdHash,
        name: req.body.userName,
        roles:["user"],
        email:req.body.email,
        fullName:req.body.fullName,
        userName:req.body.userName,
        profile:req.body.profile,
        bio:"",
        phone:"",
        gender:"",
        password: req.body.password,
        password_scheme: 'simple',
        type: "user"
      };
      couch.insertDocument('_users',clouadnt_user).then((result) => {
       // console.log("result :", result)
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
      // console.log("whatsHappening")
      // console.log("Please use different mail id as it already exists");
      res.status(500).json({
        message: "User Id already exists. Please use different Id"
      });
    }
  });
}
