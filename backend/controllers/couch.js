var Cloudant = require('@cloudant/cloudant');

if (process.env.COUCH_DB_PROVIDER == "IBM_CLOUDANT") {
  var couchDbAdminUrl = "https://" + process.env.COUCH_DB_ADMIN_USERNAME + ":" + process.env.COUCH_DB_ADMIN_PASSWORD + "@" + process.env.COUCH_DB_HOST;
} else {
  var couchDbAdminUrl = "http://" + process.env.COUCH_DB_ADMIN_USERNAME + ":" + process.env.COUCH_DB_ADMIN_PASSWORD + "@" + process.env.COUCH_DB_HOST;
}
// console.log("couchDbAdminUrl used: ",couchDbAdminUrl);
var cloudant = new Cloudant({ url: couchDbAdminUrl });

module.exports.getAllDocs = async function (db){
return new Promise((resolve, reject) => {
  // console.log("inside authenticateUser");
  var database = cloudant.db.use(db);
  database.list({include_docs:true}, function (err, data) {
    // // console.log(err, data);
    resolve(data)
  });
});
}
// Authenticate User
module.exports.authenticateUser = async function (username, password) {
  return new Promise((resolve, reject) => {
    var cloudant1 = new Cloudant({ url: couchDbAdminUrl });
    cloudant1.auth(username, password, (err, response) => {
      if(err) {
        // console.log("err while authentication",err);
        if(err.statusCode == 401) {
          // console.log("authentication failed for reason",err.reason, "with statusCode:",err.statusCode);
        } else {
          // console.log("authentication issue for reason",err.reason, "with statusCode:",err.statusCode);
        }
        // console.log("calling resolve");
        resolve(false);
      } else {
        if((response.ok == true) && (username == response.name)) {
          // console.log("authentication successfull response", response);
          resolve(true);
        } else {
          // console.log("authentication failed response", response);
          resolve(false);
        }
      }
    });
  })
}

// Check Database Existence
module.exports.checkDatabase = async function (dbName) {
  return new Promise((resolve, reject) => {
    // console.log("inside checkDatabase function",dbName);
    cloudant.db.get(dbName, (err, response) => {
      if (err) {
        if (err.statusCode == 404) { // db does not exists error -> { error: 'not_found', reason: 'Database does not exist.', statusCode: 404 }
          // console.log("database does not exists, statusCode:", err.statusCode, "error key", err.error);
          resolve(false);
        } else {
          // console.log("error on creation of database", err.statusCode, "error key", err.error);
          resolve(false);
        }
      } else {
        // console.log("got response on check database function");
        resolve(true);
      }
    });
  });
}


// Create Database per User
module.exports.createDatabase = async function (dbName) {
  return new Promise((resolve, reject) => {
    cloudant.db.create(dbName, { revs_limit: 1, auto_compaction: true, skip_setup: true }, (err, response) => { // db created successful -> response: { ok: true }
      if (err) {
        if (err.statusCode == 412) { // db already exists error -> err: { statusCode: 412, error: file_exists, .... }
          // console.log("error on creation of database", err.statusCode, "error key", err.error);
          resolve(false);
        } else {
          // console.log("error on creation of database", err.statusCode, "error key", err.error);
          resolve(false);
        }
      } else {
        // console.log("response of creation of database", response);
        resolve(true);
      }
    });
  });
  // return cloudant.use(dbName).insert({ sessionId: "", sessionName: "", sessionThumbnail: "" });
}


// setting security for users database
module.exports.getDbSecurity = async function (dbName) {
  return new Promise((resolve, reject) => {
    var db = dbName;
    var database = cloudant.db.use(db);
    var security = {};
    database.get_security(async function (err, result) {
      if (err) {
        // throw er;
        // console.log("error while getting permission for database", err);
        resolve(false);
      }
      // console.log('Got security for ' + db);
      // // console.log(result);
      // console.log("before if result.cloudant");
      if (result.cloudant && Object.keys(result.cloudant).length > 0) {
        var promiseArray = [];
        // console.log("inside if result.cloudant");
        // console.log("no. of permissions granted for this db", Object.keys(result.cloudant).length);
        for (let key in result.cloudant) {
          promiseArray.push(new Promise((resolve, reject) => {
            // console.log("key:", key, "value:", result.cloudant[key]);
            if (key != "nobody") {
              security[key] = result.cloudant[key];
            }
            resolve(true);
          }))
        }
        await Promise.all(promiseArray);
        resolve(security);
      } else {
        // console.log("There were no permissions granted for this db");
        resolve(security);
      }
    });
  });
}

module.exports.setDbSecurity = async function (dbName, userName) {
  return new Promise(async (resolve, reject) => {
    if(process.env.COUCH_DB_PROVIDER == "IBM_CLOUDANT") {
      securityInfo =  { "cloudant": {}};
      securityInfo.cloudant[userName] = [ '_replicator', '_reader', '_writer', '_admin' ];
      // console.log("securityInfo",securityInfo);
      await cloudant.request({db: dbName, method: 'put', path: '/_security', body: securityInfo
      }, (err, result) => {
        if(err) {
          // console.log("error on setting security",err);
          resolve(false);
        } else {
          // console.log("result on setting security",result);
          resolve(true);
        }
      });
    } else {
      await cloudant.request({db: dbName, method: 'put', path: '/_security', body:
        {
          admins:  { names: [userName], roles: ["_admin"] },
        }
      }, (err, result) => {
        if(err) {
          // console.log("error on setting security",err);
          resolve(false);
        } else {
          // console.log("result on setting security",result);
          resolve(true);
        }
      });
    }
  });
}

module.exports.copyDbSecurity = async function (dbName, securityInfo) {
  return new Promise(async (resolve, reject) => {
    var database = cloudant.db.use(dbName);
    var security = {};
    var apiKeyValue = {};
    if (Object.keys(securityInfo).length == 1) {
      security = securityInfo;
      securityKeyArray = Object.keys(securityInfo);
      apiKeyValue.key = securityKeyArray[0];
      apiKeyValue.password = "";
      // console.log("apiKeyValue.key", apiKeyValue.key, "apiKeyValue.password", apiKeyValue.password);
    } else {
      // console.log("no permissions are available to set");
      resolve(false);
    }
    database.set_security(security, function (err, result) {
      if (err) {
        // throw er;
        // console.log("error while setting permission for userdb", err);
        resolve(false);
      }
      // console.log('Set security for', dbName, "with key", apiKeyValue.key, "with password", apiKeyValue.password);
      // console.log(result);
      let access = { "key": apiKeyValue.key, "password": apiKeyValue.password };
      resolve(access);
    });
  });
}

// Generate API_KEY before setting permission as this functionality only provides password which can be used iun the front-end
async function generateApiKey() {
  return new Promise((resolve, reject) => {
    // console.log("inside generate api key function");
    cloudant.generate_api_key(function (err, api) {
      if (err) {
        throw err; // You probably want wiser behavior than this.
      }

      // console.log('API key: %s', api.key);
      // console.log('Password for this key: %s', api.password);
      let access = { "key": api.key, "password": api.password };
      resolve(access);
    });
  });

  // var Cloudant = require('@cloudant/cloudant');
  // var cloudant = Cloudant({ account:"me", key:api.key, password:api.password });
}


// get all documents from a database
module.exports.getAllDocsMetaData = async function (dbName) {
  return new Promise((resolve, reject) => {
    var db = cloudant.use(dbName);
    db.list(function (err, data) {
      if(err) {
        resolve(err);
      }
      // console.log("got all docsMetaData from database",dbName);
      resolve(data);
    });
  });
}

// Find User
module.exports.findUser = async function (dbName, searchValue) {
  return new Promise((resolve, reject) => {
    var db = cloudant.use(dbName);
    // dbSearchKey = `"` + searchKey + `"`;
    // console.log("serach in findDocument", searchValue);
    db.find({
      'selector': {
        name: {
          '$eq': searchValue
        }
      }
    }).then((documents) => {
      // if (err) {
      // } else {
      // console.log("documents", documents.docs.length);
      // // console.log("docs retrieved for email", documents.docs);
      resolve({ documents, statusCode: (documents.docs.length > 0) ? 200 : 404 });
      // }
    }).catch((err) => {
      // console.log("error while logging from cloudant", err);
      reject(err);
    });
  });
}

// Find session
module.exports.findSession = async function (dbName, searchValue) {
  return new Promise((resolve, reject) => {
    var db = cloudant.use(dbName);
    // dbSearchKey = `"` + searchKey + `"`;
    // console.log("search in findDocument", searchValue);
    db.find({
      'selector': {
        sessionName: {
          '$eq': searchValue
        }
      }
    }).then((documents) => {
      // console.log("documents", documents.docs.length);
      resolve({ documents, statusCode: (documents.docs.length > 0) ? 200 : 404 });
    }).catch((err) => {
      // console.log("error while logging from cloudant", err);
      resolve({ documents, statusCode: 404 });
    });
  });
}

// Find groupname
module.exports.findGroup = async function (dbName, searchValue) {
  // console.log("inside find group name ");
  return new Promise((resolve, reject) => {
    var db = cloudant.use(dbName);
    // dbSearchKey = `"` + searchKey + `"`;
    // console.log("search in findDocument", searchValue);
    db.find({
      'selector': {
        groupName: {
          '$eq': searchValue
        }
      }
    }).then((documents) => {
      // console.log("documents", documents.docs.length);
      resolve({ documents, statusCode: (documents.docs.length > 0) ? 200 : 404 });
    }).catch((err) => {
      // console.log("error while logging from cloudant", err);
      resolve({ documents, statusCode: 404 });
    });
  });
}

// Find Page
module.exports.findRecording = async function (dbName, searchValue) {
  return new Promise((resolve, reject) => {
    var db = cloudant.use(dbName);
    // dbSearchKey = `"` + searchKey + `"`;
    // console.log("search in findsession", searchValue);
    db.find({
      'selector': {
        recordingName: {
          '$eq': searchValue
        }
      }
    }).then((documents) => {
      // console.log("documents", documents.docs.length);
      resolve({ documents, statusCode: (documents.docs.length > 0) ? 200 : 404 });
    }).catch((err) => {
      // console.log("error while logging from cloudant", err);
      resolve({ documents, statusCode: 404 });
    });
  });
}

// Find Document By Id
module.exports.findById = async function (dbName, searchValue) {
  return new Promise((resolve, reject) => {
    var db = cloudant.use(dbName);
    // dbSearchKey = `"` + searchKey + `"`;
    // console.log("search in findsession", searchValue);
    db.find({
      'selector': {
        _id: {
          '$eq': searchValue
        }
      }
    }).then((documents) => {
      // console.log("documents", documents.docs.length);
      resolve({ documents, statusCode: (documents.docs.length > 0) ? 200 : 404 });
    }).catch((err) => {
      // console.log("error while logging from cloudant", err);
      resolve({ documents, statusCode: 404 });
    });
  });
}

// Insert Document into Database
module.exports.insertDocument = async function (dbName, document) {
  console.log("db name :",dbName,"doc :",document)
  return new Promise((resolve, reject) => {
    var db = cloudant.use(dbName);
    db.insert(document, (err, result) => {
      if(err) {
        console.log("err while inserting document",err.statusCode,"with reason",err.reason);
        result = {}
        result.ok = false;
        resolve(result);
      } else {
        console.log("insertDocument result in couch.js", result);
        resolve(result);
      }
    });
  });
}

// Insert Document into Database
module.exports.deleteDocument = async function (dbName, documentId, documentRev) {
  return new Promise((resolve, reject) => {
    var db = cloudant.use(dbName);
    db.destroy(documentId, documentRev).then((result) => {
      // console.log("result", result);
      resolve(result);
    }).catch(err => {
      // console.log("error while delete in couch.js",err);
    })
  });
}