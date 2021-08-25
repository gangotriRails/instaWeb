const express = require("express");
const authChecker = require("../middleware/auth-checker");
const couch = require('../controllers/couch');


const UserController = require("../controllers/user");


const router = express.Router();

router.post("/signup", UserController.createUser);

router.post("/login", UserController.userLogin);

router.get("", authChecker, (req, res, next) => {
  console.log("getting roles of users in backend");
  const mail = req.userData.email;
  var userList = [];
  var rolesList = [];
  var roles = [];
  var userInfo = {};
  couch.checkDatabase("_users").then(async (dbStatus) => {
      console.log("assignUsers exists");
      await couch.getAllDocsMetaData("_users").then(async (result) => {
          if (result.rows.length > 0) {
              for (i = 1 ; i < result.rows.length; i++) {
                  // console.log("documentId for ", i, ":", result.rows[i].id.slice(17));
                  userId = result.rows[i].id;
                  // userList.push(userId);
                  await couch.findById("_users",result.rows[i].id).then(async (response) => {
                    userInfo = {};

                    user = response.documents.docs[0];
                    userInfo["name"] = user.name;
                    userInfo["disable"] = user.disable;
                    userInfo["roles"] = user.roles;
                    // console.log("response",response);
                    // rolesInfo = response.documents.docs[0]
                    // roles = rolesInfo["roles"]
                    // // rolesList.push(roles)
                    // console.log("roles list",roles)
                    // for(let r=0;r< roles.length;r++){
                    //   console.log("roles index ",roles[r])

                    // }
                    // names = rolesInfo["name"]
                    userList.push(userInfo);
                    // console.log("names list",names)
                
                  })
              }
              // console.log("roles list",rolesList)
              console.log("names list",userList)
              res.status(200).json({
                // rolesList: rolesList,
                userList: userList
      });
             
          }
      }).catch((err) => {
          console.log("error :", err);
          res.status(200).json({
              userlist: "not exists"
          });
      })
  }).catch((err) => {
      console.log("ERROR : ", err);
  });

});

router.post("", authChecker,(req, res, next) => {
 
  console.log("diableUser",req.body.disableName ,"with id :",req.body.id);
  disableName = req.body.disableName;
  console.log("disableName",disableName);
  
//  var userRoles;
  resultId = "";
   couch.findUser("_users", disableName).then( (response) => {
      console.log("user find",response);
      if (response.statusCode == 404) {
                console.log("User not found");
                res.status(500).json({
                  message: "disable  failed!!!"
                });
              } else {
                console.log("user already exists");
                 couch.getAllDocsMetaData("_users").then( (result) => {
                  if (result.rows.length > 0) {
                    for (let i = 0; i < result.rows.length; i++) {
                        matchID = "org.couchdb.user:"+ disableName;
                        if( matchID == result.rows[i].id){ 
                      resultId = result.rows[i].id;
                      console.log("resultId", resultId)
                  }
                    }
                    couch.findById("_users", resultId).then((response) => {
                      console.log("respose in userserr", response.documents.docs[0]);
                      resetPasswordUserInfo = response.documents.docs[0];
                      if(req.body.id == "1"){ 
                      resetPasswordUserInfo["disable"] = "true";
                       couch.insertDocument("_users", resetPasswordUserInfo).then((result) => {
                        console.log("insert diable Document result", result);
                        if (result.ok == true) {
                          
                          console.log("disabled successfull");
                          res.status(201).json({
                            message: "disabled successfull"
                          });
                        } else {
                          console.log("disabled users failed");
                        }
                      });
                    }else if (req.body.id == "2"){
                      resetPasswordUserInfo["disable"] = "false";
                       couch.insertDocument("_users", resetPasswordUserInfo).then((result) => {
                        console.log("insert diable Document result", result);
                        if (result.ok == true) {
                          
                          console.log("enabled successfull");
                          res.status(201).json({
                            message: "enabled successfull"
                          });
                        } else {
                          console.log("enabled users failed");
                        }
                      });
                    }
                      
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

  router.delete("", (req, res, next) => {
    console.log("req.query.userName", req.query.userName);
    // console.log("req.params.deletingName", req.params.deleteUser);
    const deletingName = req.query.userName
    console.log("deletingName", req.query.userName);
  
    couch.findUser("_users", deletingName).then((response) => {
      console.log("user find", response.documents.docs[0]);
      if (response.statusCode == 404) {
        console.log("User not found");
        res.status(500).json({
          message: "User Deletion failed"
        });
      } else {
        var userInfo = response.documents.docs[0];
        console.log("user already exists", userInfo);
        couch.deleteDocument("_users", userInfo._id, userInfo._rev).then((response) => {
          console.log("response of deleting ", response)
          res.status(201).json({
            message: "deletion succesfulll"
          });
        }).catch((err) => {
          console.log(err);
        });
      }
    }).catch((err) => {
      console.log("err :", err);
      res.status(500).json({
        message: "User Deletion failed",
        completed: "N"
      });
    })    
  });
  

module.exports = router;
