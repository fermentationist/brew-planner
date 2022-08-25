const testController = (req, res) => {
  res.locals.sendResponse(res, { answer: 42 });
};

export default [testController];
