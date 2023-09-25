import "dotenv/config";
import express from "express";
import ip from "ip";
import cors from "cors";
import { parse } from "qs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import morgan from "morgan";
import router from "../routes/index.js";
import { sendResponse, sendError } from "./responses.js";
import errorHandler from "../middleware/error-handler.js";
import { opError, inputError } from "./errors.js";

const app = express();

const PROD_MODE = process.env.PROD_MODE === "true" ? true : false;
// const STATIC_FOLDER = SERVE_MODE ? "../client" : "./";
const PORT = process.env.SERVER_PORT;

const filename = fileURLToPath(import.meta.url);
const dirName = dirname(filename);
const logger = morgan("dev");

app.use(logger);

const corsOptions = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  credentials: false,
  preflightContinue: true,
  maxAge: 600,
};

app.options("*", cors(corsOptions), (req, res) => {
  return sendResponse(res);
});

app.use(cors(corsOptions));

//set limit to the query param array
app.set("query parser", str => {
  return parse(str, { arrayLimit: 50 });
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (PROD_MODE) {
  // serve static assets from build/client
  app.use(express.static("build/client"));
} else {
  //serve documentation
  app.use("/docs", express.static("doc"));
}

app.use((req, res, next) => {
  res.locals.sendResponse = sendResponse;
  res.locals.sendError = sendError;
  res.locals.opError = opError;
  res.locals.inputError = inputError;
  res.set("Content-Type", "application/json");
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Credentials", false)
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Firebase-Token");
  next();
});

app.use("/api", router);

app.get("/*", (req, res, next) => {// catch-all route, serve SPA
  const clientPath = PROD_MODE ? "../../../build/client/index.html" : "../../../index.html";
  const newPath = path.join(dirName, clientPath);
  res.setHeader("Content-Type", "text/html");
  res.sendFile(newPath);
});

// error handling middleware (must go last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Express app listening...📡");
  console.log("Local: http://localhost:" + PORT);
  console.log("Network: " + "http://" + ip.address() + ":" + PORT);
});

export default app;
