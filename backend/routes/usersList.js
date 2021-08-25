const express = require("express");
const router = express.Router();
const authChecker = require("../middleware/auth-checker");
const couch = require('../controllers/couch');
console.log("userLists");

router.get("",authChecker, (req, res, next) => {
    console.log("getting assignUsers in backend");
    const mail = req.userData.email;
    var userList = [];
    console.log("mail", mail);
    couch.checkDatabase("_users").then(async (dbStatus) => {
        console.log("assignUsers exists");
        await couch.getAllDocsMetaData("_users").then(async (result) => {
            if (result.rows.length > 0) {
                for (i = 1; i < result.rows.length; i++) {
                    console.log("documentId for ", i, ":", result.rows[i].id.slice(17));
                    userId = result.rows[i].id.slice(17);
                    userList.push(userId);
                }
                res.status(200).json({
                    userlist: userList
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

module.exports = router;