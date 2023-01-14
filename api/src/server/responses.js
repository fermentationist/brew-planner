//response handling

const TEST_MODE = process.env.TEST_MODE === "false" ? false : true;

export const sendError = (res, error) => {
  const isOp = error.type === "operational";
  const errorName = error.name || (isOp ? "bad request" : "server error");
  const statusCode = error.httpCode || (isOp ? 400 : 500);
  const baseMessage = "Something has gone wrong with your request.";
  const longMessage =
    baseMessage + " If the problem continues, contact fermentationist@gmail.com.";
  const errorMessage = isOp
    ? error.message || baseMessage
    : TEST_MODE
    ? error.message || longMessage
    : longMessage;

  const data = {
    status: "failed",
    error: {
      name: errorName,
      message: errorMessage
    }
  };
  if (res.locals.beforeEnd) {
    //this is a way for a module to specify a function to be called before response ends
    res.locals.beforeEnd(() => {
      return res.status(statusCode).end(JSON.stringify(data));
    });
  } else {
    return res.status(statusCode).end(JSON.stringify(data));
  }
};

export const sendResponse = (res, data = {}) => {
  data = { status: "ok", ...data };
  if (res.locals.beforeEnd) {
    //this is a way for a module to specify a function to be called before response ends
    res.locals.beforeEnd(() => {
      return res.status(200).end(JSON.stringify(data));
    });
  } else {
    return res.status(200).end(JSON.stringify(data));
  }
};

