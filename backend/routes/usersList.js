const express = require("express");
const router = express.Router();
const authChecker = require("../middleware/auth-checker");
const couch = require('../controllers/couch');

router.get("",authChecker, (req, res, next) => {
    var userList = [];
    couch.checkDatabase("_users").then(async (dbStatus) => {
        await couch.getAllDocs("_users").then(async (result) => {
            if (result.rows.length > 0) {
                for (i = 1; i < result.rows.length; i++) {
                    delete result.rows[i].doc["_id"];
                    delete result.rows[i].doc["_rev"];
                    delete result.rows[i].doc["roles"];
                    delete result.rows[i].doc["password_scheme"];
                    delete result.rows[i].doc["type"];
                    delete result.rows[i].doc["salt"];
                    delete result.rows[i].doc["password_sha"];
                    userList.push(result.rows[i].doc);
                }
                // console.log("userList :: ",userList)
                res.status(200).json({
                    userList: userList
                });
            }
        }).catch((err) => {
            res.status(200).json({
                userlist: "not exists"
            });
        })
    }).catch((err) => {
        // console.log("ERROR : ", err);
    });

});

module.exports = router;