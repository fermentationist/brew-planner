// import * as breweryService from "../services/brewery.js";
import * as validate from "../middleware/input-validation.js";
import { rejectOnFalse } from "../utils/helpers.js";

//validation helpers
export const breweryIdChecker = input => breweryService.isExistingBreweryAttribute(input, "breweryId");
export const isExistingBreweryId = rejectOnFalse(breweryIdChecker);
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
 * @apiSuccess {String} breweries.breweryId A unique identifier for the brewery
 * @apiSuccess {String} breweries.name A unique name for the brewery
 * @apiSuccess {Object} breweries.address
 * @apiSuccess {String} breweries.address.street
 * @apiSuccess {String} breweries.address.unit
 * @apiSuccess {String} breweries.address.city
 * @apiSuccess {String} breweries.address.state
 * @apiSuccess {String} breweries.address.zip
 * @apiSuccess {String} breweries.address.country
 */

export const getBreweries = async (req, res, next) => {
  try {
    // const allBreweries = await breweryService.getBreweries();
    console.log("getBreweries hit")
    const allBreweries = [{
      breweryId: "fermentationists-brewery",
      name: "Fermentationist's Brewery",
      address: {
        street: "4822 N Rockwell St",
        city: "Chicago",
        state: "IL",
        zip: "60625"
      }
    }];
    if (res.locals.user.role === "admin") {
      return res.locals.sendResponse(res, { breweries: allBreweries });
    }
    const authorizedBreweries = allBreweries.filter(brewery =>
      res.locals.user.breweries.includes(brewery.breweryId)
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
 * @apiBody {String{minimum length: 2 characters, maximum length: 36 characters}} breweryId A unique identifier for the brewery
 * @apiBody {Object} [address] The brewery's physical address
 * @apiBody {String} [address.street]
 * @apiBody {String} [address.unit]
 * @apiBody {String} [address.city]
 * @apiBody {String{length: 2 characters}} [address.state]
 * @apiBody {String} [address.zip]
 * @apiBody {String} [address.country]
 * @apiUse successResponse
 * @apiSuccess {String} breweryId
 */
const createBreweryValidation = [
  validate
    .body("name")
    .exists(opt)
    .isString()
    .isLength({ max: 30 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("breweryId")
    .exists(opt)
    .isString()
    .isLength({ min: 2, max: 36 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("address.street")
    .optional(opt)
    .isString()
    .isLength({ max: 100 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("address.unit")
    .optional(opt)
    .isString()
    .isLength({ max: 50 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("address.city")
    .optional(opt)
    .isString()
    .isLength({ max: 50 })
    .customSanitizer(validate.xssSanitize),
  validate.body("address.state").optional(opt).isString({ min: 2, max: 2 }),
  validate.body("address.zip").optional(opt).isString({ min: 5, max: 5 }),
  validate
    .body("address.country")
    .optional(opt)
    .isString({ max: 30 })
    .customSanitizer(validate.xssSanitize),
  validate.catchValidationErrors
];

const createBreweryFunction = async (req, res, next) => {
  try {
    const breweryId = await breweryService.createBrewery(
      validate.cleanRequestBody(req)
    );
    return res.locals.sendResponse(res, { breweryId });
  } catch (error) {
    console.log(error);
    return next(res.locals.opError("Brewery creation failed", error));
  }
};

export const createBrewery = [createBreweryValidation, createBreweryFunction];

// updateBrewery
/**
 * @api {patch} /admin/breweries/:breweryId Update brewery (admin)
 * @apiName UpdateBrewery
 * @apiGroup Breweries
 * @apiDescription Update a brewery's name or address
 * @apiUse authHeader
 * @apiParam {String} breweryId The brewery's unique identifier
 * @apiBody {String} [name] A unique name for the brewery
 * @apiBody {Object} [address] The brewery's physical address
 * @apiBody {String} [address.street]
 * @apiBody {String} [address.unit]
 * @apiBody {String} [address.city]
 * @apiBody {String{length: 2 characters}} [address.state]
 * @apiBody {String} [address.zip]
 * @apiBody {String} [address.country]
 * @apiUse successResponse
 * @apiSuccess {String} breweryId
 */
const updateBreweryValidation = [
  validate
    .param("breweryId")
    .exists(opt)
    .custom(isExistingBreweryId),
  validate
    .body("name")
    .optional(opt)
    .isString()
    .isLength({ max: 30 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("address.street")
    .optional(opt)
    .isString()
    .isLength({ max: 100 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("address.unit")
    .optional(opt)
    .isLength({ max: 50 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("address.city")
    .optional(opt)
    .isString()
    .isLength({ max: 50 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("address.state")
    .optional(opt)
    .isAlpha()
    .isLength({ min: 2, max: 2 }),
  validate.body("address.zip").optional(opt).isString().isPostalCode("US"),
  validate
    .body("address.country")
    .optional(opt)
    .isString()
    .isLength({ max: 30 })
    .customSanitizer(validate.xssSanitize),
  validate.catchValidationErrors
];

const updateBreweryFunction = async (req, res, next) => {
  try {
    const cleanedData = validate.cleanRequestBody(req);
    if (!Object.keys(cleanedData).length) {
      return next(res.locals.opError("Brewery update failed - empty request"));
    }
    await breweryService.updateBrewery(
      req.params.breweryId,
      validate.cleanRequestBody(req)
    );
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(res.locals.opError("Brewery update failed", error));
  }
};

export const updateBrewery = [updateBreweryValidation, updateBreweryFunction];

// deleteBrewery
/**
 * @api {delete} /admin/breweries/:breweryId Delete brewery (admin)
 * @apiName DeleteBrewery
 * @apiGroup Breweries
 * @apiDescription Delete a brewery
 * @apiUse authHeader
 * @apiParam {String} breweryId The brewery's unique identifier
 * @apiUse successResponse
 */
const deleteBreweryValidation = [
  validate
    .param("breweryId")
    .exists(opt)
    .isString()
    .isLength({ min: 2, max: 36 })
    .custom(validate.xssSanitize),
  validate.catchValidationErrors
];

const deleteBreweryFunction = async (req, res, next) => {
  try {
    await breweryService.deleteBrewery(req.params.breweryId);
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(res.locals.opError("Brewery deletion failed", error));
  }
};

export const deleteBrewery = [deleteBreweryValidation, deleteBreweryFunction];
