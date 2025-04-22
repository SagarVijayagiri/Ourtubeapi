const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();


const userroute = require("./routes/user");
const videoroute = require("./routes/video");
const commentroute = require("./routes/comment");
const fileUpload = require("express-fileupload");
const fs = require("fs");

// Connect to MongoDB
const connectWithDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database successfully connected");
  } catch (err) {
    console.error("Database connection error:", err);
  }
};

connectWithDatabase();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "./tmp/" 
}));


if (!fs.existsSync("./tmp/")) {
  fs.mkdirSync("./tmp/", { recursive: true });
  fs.chmodSync("./tmp/", 0o777);
  console.log("Created tmp/ directory with 777 permissions");
}

// Routes
app.use("/user", userroute);
app.use("/video",videoroute);
app.use("/comment",commentroute)
module.exports = app;