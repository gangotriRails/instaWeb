const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var crypto = require('crypto');

const couch = require("./couch");

// User Login
exports.userLogin = async (req, res, next) => {
  console.log("Calling Cloudant findUser function");
  userEmail = req.body.email;
  password = req.body.password;
  let userInfo,perUserDb;
  await couch.authenticateUser(userEmail, password).then(async (status) => {
    console.log("status :",status);
    if(status == true) {
      console.log("CouchDb Authentication successful");
      await couch.findUser("_users",userEmail).then(async (response) => {
        console.log("Got Output from Cloudant findUser function on Login :",response);
        if (response.statusCode == 404) {
          console.log("User not found. Sending 404 response");
          return res.status(401).json({
            message: "Invalid credentials"
          });
        } else {
          console.log("User record count in Cloudant authdb", response.documents.docs.length);
          console.log("User found in Cloudant authdb", response.documents.docs);
          if (response.documents.docs.length == 1) {
            userInfo = response.documents.docs[0];
            console.log("User found in Cloudant authdb", userInfo);
            console.log("User found in Cloudant authdb ID :", userInfo.userId);
              perUserDb = "per_user_" + userInfo.userId;
              console.log("checking db existence for",perUserDb);
              couch.checkDatabase(perUserDb).then(async (dbStatus) => {
                console.log("checked Database existence ++++++++++++++++++++++++++++", dbStatus);
                if(!dbStatus) {
                  console.log("creating db for user", perUserDb);
                  dbCreationStatus = await couch.createDatabase(perUserDb).then(status => {
                    console.log("database creation successful", status);
                    return status;
                  }).catch((err) => {
                    console.log(err);
                  });
                }
                  securityInfo = {};
                  securityInfo[userInfo.name] = ['_admin', '_replicator', '_reader', '_writer'];
                  couch.setDbSecurity(perUserDb, userInfo.name).then(async (status) => {
                    console.log("permission granted successfully for userdb", status);
                    await couch.getAllDocsMetaData(perUserDb).then(async (result) => {
                      console.log("got all docsMetada for ",perUserDb);
                      if(result.rows.length > 0) {
                        for(i = 0; i < result.rows.length; i++) {
                          console.log("documentId for ",i,":",result.rows[i].id);
                           postsDb = "posts_"+result.rows[i].id;
                          await couch.setDbSecurity( postsDb, userInfo.name).then((status) => {
                            console.log("granted permission for", postsDb,"with status",status);
                          });
                        }
                      }
                    });
                    const token = jwt.sign(
                      { email: userInfo.email, userId: userInfo.userId},
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
                      expiresIn: 31536000,
                      userId: userInfo.userId,
                      email: userInfo.email,
                      fullName:userInfo.fullName,
                      userName:userInfo.userName,
                      profile:userInfo.profile,
                      role: userInfo.roles,
                      dbUrl: couchDbAdminUrl,
                      userDb: perUserDb,
                      userDbKey: userInfo.name,
                      userDbPwd: password
                    });
                  }).catch((err) => {
                    console.log("error while granting permission for userdb", err);
                  });
              }).catch((err) => {
                console.log("cant create database")
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
  console.log("email :",req.body.email);
  console.log("fullName :",req.body.fullName);
  console.log("userName :",req.body.userName);
  console.log("password :",req.body.password);
  console.log("profile :",req.body.profile);


  await couch.findUser("_users",req.body.email).then(async (response) => {
    console.log("Got Output from Cloudant find function on createUser");
    if (response.statusCode == 404) {
      console.log("User not found");
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
        password: req.body.password,
        password_scheme: 'simple',
        type: "user"
      };
      couch.insertDocument('_users',clouadnt_user).then((result) => {
       console.log("result :", result)
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
      console.log("whatsHappening")
      console.log("Please use different mail id as it already exists");
      res.status(500).json({
        message: "User Id already exists. Please use different Id"
      });
    }
  });
}
