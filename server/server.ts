// require("dotenv").config();
// const initLogger = require("@spirithub/logger");
// const express = require('express');
// const path = require('path');
// const cookieParser = require('cookie-parser');
// const ip = require('ip');
// const bodyParser = require("body-parser");
// const app = express();
// const createProxyMiddleware=require("http-proxy-middleware");
// const apiRouter=require("./api/router"); //json api router
// const createAuthGroups = require("./auth/src/add-groups.js");
// const SERVE_MODE = (process.env.PROD_MODE === "true" || process.env.SERVE_MODE ==="true") ? true : false;
// const STATIC_FOLDER = SERVE_MODE ? "build" : "public";
// const AUTH_MODE = process.env.AUTH_MODE === "false" ? false : true;
// const TEST_MODE = process.env.TEST_MODE === "false" ? false : true;

// const loggerConfig = {
//   domain: process.env.ELASTICSEARCH_LOGGING_DOMAIN,
//   username: process.env.ELASTICSEARCH_LOGGING_USERNAME,
//   password: process.env.ELASTICSEARCH_LOGGING_PASSWORD,
//   indexPrefix: "admin-logs",
//   testMode: TEST_MODE,
//   blacklist: [
//     "credit_card",
//     "card_number",
//     "cc_num",
//   ],
//   excludePatterns: [
//     /firebase/i,
//     /password/i,
//     /authorization/i
//   ]
// }


// const logger = initLogger(loggerConfig);
// app.use(logger);

// app.use(bodyParser.urlencoded({extended:true}));
// app.use(cookieParser());

// app.use(express.static(path.join(__dirname, STATIC_FOLDER))); //serve static folder

// if (AUTH_MODE) {
//   createAuthGroups();
//   app.use(["/auth", "/"], require("./auth/router.js"));
// }

// //proxying to elastic search kibana for sales dashboard
// const ELASTICSEARCH_DOMAIN = "https://" + process.env.ELASTICSEARCH_DOMAIN;
// app.use("/_plugin/kibana", createProxyMiddleware({
//   target : ELASTICSEARCH_DOMAIN,
//   changeOrigin:true
// }));

// app.use("/api", apiRouter.router);  // JSON REST API

// app.use("/", function(req, res, next) {// catch-all route
//   const clientPath = SERVE_MODE === true ? "../admin/build/index.html" : "../admin/public/index.html";
//   res.sendFile(path.join(__dirname, clientPath));
// });

// app.use((err, req, res, next) => { // error handling route
//   let error = err;
//   if (typeof err !== "object") {
//     error = {
//       name: err
//     }
//   }
//   res.error = error;
//   res.status(err.httpCode || 500).send(err);
// });

// console.log("Local: http://localhost:" + process.env.PORT);
// console.log ("Network: " + "http://" + ip.address() + ":" + process.env.PORT);


// module.exports = app;

import { config } from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs";
import https from "https";
import apiRouter from "./api/router.js";

config();

const SERVE_MODE = (process.env.PROD_MODE === "true" || process.env.SERVE_MODE === "true") ? true : false;
const STATIC_FOLDER = SERVE_MODE ? "../client" : "./";
const PORT = process.env.SERVER_PORT;

const filename = fileURLToPath(import.meta.url);
const dirName = dirname(filename);

const app = express();
let server;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const staticPath = path.join(dirName, STATIC_FOLDER);
app.use(express.static(staticPath)); //serve static folder

app.use("/api", apiRouter);

app.get("/*", (req, res, next) => {// catch-all route
  const clientPath = SERVE_MODE ? "../client/index.html" : "./index.html";
  const newPath = path.join(dirName, clientPath);
  res.sendFile(newPath);
});


if (process.env.HTTPS_MODE == "true") {
  //https server using provided certificate and privateKey pair
  const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, "utf8");
  const certificate = fs.readFileSync(process.env.CERT_PATH, "utf8");
  //server accepts connections signed by provided selfCert
  const options = {
    key: privateKey,
    cert: certificate,
    requestCert: false,
    rejectUnauthorized: false
  };
  server = https.createServer(options, app);
  server.listen(PORT, function () {
    console.log(`HTTPS server listening on port ${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Express app listening on port ${PORT}`);
  });
}

export default server ? server : app;
