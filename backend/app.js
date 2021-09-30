const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const userListRoutes = require("./routes/usersList")
const editRoutes = require("./routes/edit")
const postRoutes = require("./routes/posts")
const getPostById = require("./routes/getPostById")
const getPostByUser = require("./routes/getPostByUser")
const editPost = require('./routes/editPost')
const getComments = require('./routes/getComments')



const app = express();
//// console.log("app initiated")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/data", express.static(path.join("backend/data")));

app.use("/", express.static(path.join(__dirname, "Insta-Web")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});
app.use(express.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true,parameterLimit:50000}));
app.use("/api/post", postRoutes);
app.use("/api/user", userRoutes);
app.use("/api/usersList", userListRoutes);
app.use("/api/edit", editRoutes);
app.use("/api/getPostById", getPostById);
app.use("/api/getPostByUser", getPostByUser);
app.use("/api/editPost", editPost);
app.use("/api/editPost", editPost);
app.use("/api/getComments", getComments);







app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "Insta-Web", "index.html"));
});
app.get('*', (req, res) =>{
  res.sendFile(path.join(__dirname , "Insta-Web", "index.html"));
});
console.log("Starting app !!!");
module.exports = app;
