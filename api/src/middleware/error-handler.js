/* 
eslint no-unused-vars: off
*/
const errorHandler = (err, req, res) => {
  res.error = err;
  if (!err.isCustomError) {
    //error was not caught or was not declared in custom error class
    console.log("UNDECLARED ERROR");
    console.error(err);
    console.error(err.stack);
  }
  if (err.type === "program") {
    console.log("PROGRAM ERROR");
    console.error(err);
    console.error(err.stack);
  } 
  res.locals.sendError(res, err);
}

export default errorHandler;

// Process listeners

process.on("unhandledRejection", error => {
  console.log("unhandledRejection:");
  console.error(error);
  console.error(error.stack);
  throw error;
});

process.on("uncaughtException", error => {
  console.log("uncaughtException:");
  console.error(error);
  console.error(error.stack);

  if (error.type !== "operational") { // crash on program errors
    console.log("calling process.exit(1)");
    process.exit(1);
  }
});

process.on("warning", warning => {
  console.log("warning:");
  console.log(warning);
});

process.on("rejectionHandled", rejection => {
  console.log("rejectionHandled:");
  console.log(rejection);
})
