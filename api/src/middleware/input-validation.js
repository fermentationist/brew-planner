/* eslint no-undef: "off" */
//input validation helpers
export { body, param, query } from "express-validator";
import { validationResult, matchedData } from "express-validator";
import sanitize from "xss";
import { inputError } from "../server/errors.js";

//helper middleware function to handle validation/input sanitation errors in controllers
export const catchValidationErrors = (req, res, next) => {
  const errors = validationResult(req).errors;
  if (errors.length) {
    return next(inputError(errors));
  }
  return next();
};

// will pass only validated data, i.e. other data included in body that is not specified in validation rules will be removed
export const cleanRequestBody = (req, {includeOptionals = true, removeUndefined = false} = {}) => {
  let output = {};
  const data = matchedData(req, { locations: ["body"], includeOptionals });
  if (removeUndefined) {
    for (const param in data) {
      if (data[param] !== undefined) {
        output[param] = data[param];
      }
    }
  } else {
    output = data
  }
  return output;
}; 

export const xssSanitize = sanitize;
