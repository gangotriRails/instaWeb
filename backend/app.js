const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const userListRoutes = require("./routes/usersList")
const editRoutes = require("./routes/edit")


const app = express();
//console.log("app initiated")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/data", express.static(path.join("backend/data")));

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
app.use("/api/posts", userRoutes);
app.use("/api/user", userRoutes);
app.use("/api/usersList", userListRoutes);
app.use("/api/edit", editRoutes);




app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "Insta-Web", "index.html"));
});

module.exports = app;
