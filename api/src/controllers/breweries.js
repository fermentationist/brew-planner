import * as breweryService from "../services/brewery.js";
import * as validate from "../middleware/input-validation.js";
import { rejectOnFalse } from "../utils/helpers.js";

//validation helpers
export const breweryUuidChecker = async input => {
  const result = await breweryService.isExistingBreweryAttribute(input, "breweryUuid")
  return result;
};
export const isExistingBreweryUuid = rejectOnFalse(breweryUuidChecker);
const opt = { checkFalsy: true };

// getBreweries
/**
 * @api {get} /breweries Get breweries
 * @apiName GetBreweries
 * @apiGroup Breweries
 * @apiUse authHeader
 * @apiDescription Get all breweries the user is authorized for
 * @apiUse successResponse
 * @apiSuccess {Object[]} breweries An array of brewery objects, containing all breweries the user has access to
 * @apiSuccess {String} breweries.breweryUuid A unique identifier for the brewery
 * @apiSuccess {String} breweries.name A unique name for the brewery
 * @apiSuccess {Object} breweries.address
 * @apiSuccess {String} breweries.street
 * @apiSuccess {String} breweries.unit
 * @apiSuccess {String} breweries.city
 * @apiSuccess {String} breweries.state
 * @apiSuccess {String} breweries.zip
 * @apiSuccess {String} breweries.country
 */

export const getBreweries = async (req, res, next) => {
  try {
    const allBreweries = await breweryService.getBreweries();
    if (res.locals.user.role === "admin") {
      return res.locals.sendResponse(res, { breweries: allBreweries });
    }
    const authorizedBreweries = allBreweries.filter(brewery =>
      res.locals.user.breweries.includes(brewery.breweryUuid)
    );
    return res.locals.sendResponse(res, { breweries: authorizedBreweries });
  } catch (error) {
    return next(res.locals.opError("getBreweries request failed", error));
  }
};

// createBrewery
/**
 * @api {post} /admin/breweries Create brewery
 * @apiName CreateBrewery
 * @apiGroup Breweries
 * @apiDescription Create a new brewery
 * @apiUse authHeader
 * @apiBody {String} name A unique name for the brewery
 * @apiBody {String} [breweryUuid] A unique identifier for the brewery (Must be a valid UUID v1. Will be generated by the database, if not supplied)
 * @apiBody {String} [street]
 * @apiBody {String} [unit]
 * @apiBody {String} [city]
 * @apiBody {String{length: 2 characters}} [state]
 * @apiBody {String} [zip]
 * @apiBody {String} [country]
 * @apiUse successResponse
 * @apiSuccess {String} breweryUuid
 */
const createBreweryValidation = [
  validate
    .body("name")
    .exists(opt)
    .isString()
    .isLength({ max: 30 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("breweryUuid")
    .optional(opt)
    .isUUID(1),
  validate
    .body("street")
    .optional(opt)
    .isString()
    .isLength({ max: 100 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("unit")
    .optional(opt)
    .isString()
    .isLength({ max: 50 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("city")
    .optional(opt)
    .isString()
    .isLength({ max: 50 })
    .customSanitizer(validate.xssSanitize),
  validate.body("stateOrProvince").optional(opt).isString().isLength({ min: 2, max: 2 }),
  validate.body("postalCode").optional(opt).isString().isPostalCode("US"),
  validate
    .body("country")
    .optional(opt)
    .isString()
    .isLength({ max: 30 })
    .customSanitizer(validate.xssSanitize),
  validate.catchValidationErrors
];

const createBreweryFunction = async (req, res, next) => {
  try {
    const breweryUuid = await breweryService.createBrewery(
      validate.cleanRequestBody(req, {removeUndefined: true})
    );
    return res.locals.sendResponse(res, { breweryUuid });
  } catch (error) {
    console.log(error);
    return next(res.locals.opError("Brewery creation failed", error));
  }
};

export const createBrewery = [createBreweryValidation, createBreweryFunction];

// updateBrewery
/**
 * @api {patch} /admin/breweries/:breweryUuid Update brewery (admin)
 * @apiName UpdateBrewery
 * @apiGroup Breweries
 * @apiDescription Update a brewery's name or address
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiBody {String} [name] A unique name for the brewery
 * @apiBody {String} [street]
 * @apiBody {String} [unit]
 * @apiBody {String} [city]
 * @apiBody {String{length: 2 characters}} [state]
 * @apiBody {String} [zip]
 * @apiBody {String} [country]
 * @apiUse successResponse
 * @apiSuccess {String} breweryUuid
 */
const updateBreweryValidation = [
  validate
    .param("breweryUuid")
    .exists(opt)
    .custom(isExistingBreweryUuid),
  validate
    .body("name")
    .optional(opt)
    .isString()
    .isLength({ max: 30 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("street")
    .optional(opt)
    .isString()
    .isLength({ max: 100 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("unit")
    .optional(opt)
    .isLength({ max: 50 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("city")
    .optional(opt)
    .isString()
    .isLength({ max: 50 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("stateOrProvince")
    .optional(opt)
    .isAlpha()
    .isLength({ min: 2, max: 2 }),
  validate.body("postalCode").optional(opt).isString().isPostalCode("US"),
  validate
    .body("country")
    .optional(opt)
    .isString()
    .isLength({ max: 30 })
    .customSanitizer(validate.xssSanitize),
  validate.catchValidationErrors
];

const updateBreweryFunction = async (req, res, next) => {
  try {
    const cleanedData = validate.cleanRequestBody(req, {removeUndefined: true});
    if (!Object.keys(cleanedData).length) {
      return next(res.locals.opError("Brewery update failed - empty request"));
    }
    await breweryService.updateBrewery(
      req.params.breweryUuid,
      cleanedData
    );
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(res.locals.opError("Brewery update failed", error));
  }
};

export const updateBrewery = [updateBreweryValidation, updateBreweryFunction];

// deleteBrewery
/**
 * @api {delete} /admin/breweries/:breweryUuid Delete brewery (admin)
 * @apiName DeleteBrewery
 * @apiGroup Breweries
 * @apiDescription Delete a brewery
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiUse successResponse
 */
const deleteBreweryValidation = [
  validate
    .param("breweryUuid")
    .exists(opt)
    .custom(isExistingBreweryUuid),
  validate.catchValidationErrors
];

const deleteBreweryFunction = async (req, res, next) => {
  try {
    await breweryService.deleteBrewery(req.params.breweryUuid);
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(res.locals.opError("Brewery deletion failed", error));
  }
};

export const deleteBrewery = [deleteBreweryValidation, deleteBreweryFunction];
