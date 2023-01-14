import * as brewhouseService from "../services/brewhouse.js";
import { isExistingBreweryUuid } from "./breweries.js";
import * as validate from "../middleware/input-validation.js";
import { isExistingUid } from "./users.js";
import { rejectOnFalse } from "../utils/helpers.js";

//validation helpers

const opt = { checkFalsy: true };
const numOpt = { no_symbols: true };

const brewhouseUuidChecker = (input) =>
  brewhouseService.isExistingBrewhouseAttribute(input, "brewhouseUuid");
const isExistingBrewhouseUuid = rejectOnFalse(brewhouseUuidChecker);

// getBrewhouses
/**
 * @api {get} breweries/:breweryId/brewhouses Get brewhouses
 * @apiName GetBrewhouses
 * @apiGroup Brewhouses
 * @apiUse authHeader
 * @apiParam {String} breweryId The brewery's unique identifier
 * @apiDescription Get all brewhouses for a given brewery
 * @apiUse successResponse
 * @apiSuccess {Object[]} brewhouses An array of brewhouse objects, containing all brewhouses for a given brewery
 * @apiSuccess {String} brewhouses.name
 */

const getBrewhousesValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.catchValidationErrors,
];

const getBrewhousesFunction = async (req, res, next) => {
  try {
    const brewhouses = await brewhouseService.getBrewhouses(
      req.params.breweryUuid
    );
    return res.locals.sendResponse(res, { brewhouses });
  } catch (error) {
    return next(res.locals.opError("getBreweries request failed", error));
  }
};

export const getBrewhouses = [getBrewhousesValidation, getBrewhousesFunction];

// createBrewhouse
/**
 * @api {post} breweries/:breweryUuid/brewhouses Create brewhouse
 * @apiName CreateBrewhouse
 * @apiGroup Brewhouses
 * @apiDescription Create a new brewhouse
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiBody {String} name A unique name for the brewhouse
 * @apiBody {String} brewhouseUuid A unique identifier for the brewhouse (a v1 UUID)
 * @apiBody {String} createdBy The uid of the user who created the brewhouse
 * @apiBody {Number} batchSize The target volume, in liters
 * @apiBody {Number} tunVolume Volume in liters
 * @apiBody {Number} tunWeight Weight in kilograms
 * @apiBody {Number} [tunLoss] Volume in liters
 * @apiBody {Number} tunSpecificHeat Specific heat, in Cal/gram-deg Celcius
 * @apiBody {Number} [lauterDeadspace] Volume in liters
 * @apiBody {Number} [topUpWater] Volume in liters (for partial-boil)
 * @apiBody {Number} [trubChillerLoss] Volume in liters
 * @apiBody {Number} evaporationRate liters/hour
 * @apiBody {Number} kettleVol Volume in liters
 * @apiBody {Number} [miscLoss] Volume in liters
 * @apiBody {Number} extractEfficiency Percentage (i.e. 75.25 = 75.25%)
 * @apiBody {Number} grainAbsorptionRate liters/kilogram
 * @apiBody {Number} hopUtilization Percentage
 * @apiUse successResponse
 * @apiSuccess {String} brewhouseUuid
 */

const createBrewhouseValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate
    .body("name")
    .exists(opt)
    .isString()
    .isLength({ max: 100 })
    .customSanitizer(validate.xssSanitize),
  validate.body("brewhouseUuid").optional(opt).isUUID(1),
  validate.body("createdBy").exists(opt).isString().custom(isExistingUid),
  validate.body("batchSize").exists(opt).isNumeric(),
  validate.body("tunVolume").exists(opt).isNumeric(),
  validate.body("tunWeight").exists(opt).isNumeric(),
  validate.body("tunLoss").optional().isNumeric(),
  validate.body("tunSpecificHeat").exists().isNumeric(),
  validate.body("lauterDeadspace").optional().isNumeric(),
  validate.body("topUpWater").optional().isNumeric(),
  validate.body("trubChillerLoss").optional().isNumeric(),
  validate.body("evaporationRate").exists().isNumeric(),
  validate.body("kettleVol").exists(opt).isNumeric(),
  validate.body("miscLoss").optional().isNumeric(),
  validate.body("extractEfficiency").exists(opt).isNumeric(),
  validate.body("grainAbsorptionRate").exists(opt).isNumeric(),
  validate.body("hopUtilization").exists().isNumeric(),
  validate.catchValidationErrors,
];

const createBrewhouseFunction = async (req, res, next) => {
  try {
    const brewhouseUuid = await brewhouseService.createBrewhouse(
      req.params.breweryUuid,
      validate.cleanRequestBody(req, { removeUndefined: true })
    );
    return res.locals.sendResponse(res, { brewhouseUuid });
  } catch (error) {
    console.log(error);
    return next(res.locals.opError("Brewhouse creation failed", error));
  }
};

export const createBrewhouse = [
  createBrewhouseValidation,
  createBrewhouseFunction,
];

// updateBrewhouse
/**
 * @api {post} breweries/:breweryUuid/brewhouses/:brewhouseUuid Update brewhouse
 * @apiName UpdateBrewhouse
 * @apiGroup Brewhouses
 * @apiDescription Update a brewhouse
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} brewhouseUuid The brewhouse's unique identifier
 * @apiBody {String} name A unique name for the brewhouse
 * @apiBody {Number} batchSize The target volume, in liters
 * @apiBody {Number} tunVolume Volume in liters
 * @apiBody {Number} tunWeight Weight in kilograms
 * @apiBody {Number} [tunLoss] Volume in liters
 * @apiBody {Number} tunSpecificHeat Specific heat, in Cal/gram-deg Celcius
 * @apiBody {Number} [lauterDeadspace] Volume in liters
 * @apiBody {Number} [topUpWater] Volume in liters (for partial-boil)
 * @apiBody {Number} [trubChillerLoss] Volume in liters
 * @apiBody {Number} evaporationRate liters/hour
 * @apiBody {Number} kettleVol Volume in liters
 * @apiBody {Number} [miscLoss] Volume in liters
 * @apiBody {Number} extractEfficiency Percentage (i.e. 75.25 = 75.25%)
 * @apiBody {Number} grainAbsorptionRate liters/kilogram
 * @apiBody {Number} hopUtilization Percentage
 * @apiUse successResponse
 */

const updateBrewhouseValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.param("brewhouseUuid").exists(opt).custom(isExistingBrewhouseUuid),
  validate
    .body("name")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .customSanitizer(validate.xssSanitize),
  validate.body("batchSize").optional().isNumeric(),
  validate.body("tunVolume").optional().isNumeric(),
  validate.body("tunWeight").optional().isNumeric(),
  validate.body("tunLoss").optional().isNumeric(),
  validate.body("tunSpecificHeat").optional().isNumeric(),
  validate.body("lauterDeadspace").optional().isNumeric(),
  validate.body("topUpWater").optional().isNumeric(),
  validate.body("trubChillerLoss").optional().isNumeric(),
  validate.body("evaporationRate").optional().isNumeric(),
  validate.body("kettleVol").optional().isNumeric(),
  validate.body("miscLoss").optional().isNumeric(),
  validate.body("extractEfficiency").optional().isNumeric(),
  validate.body("grainAbsorptionRate").optional().isNumeric(),
  validate.body("hopUtilization").optional().isNumeric(),
  validate.catchValidationErrors,
];

const updateBrewhouseFunction = async (req, res, next) => {
  try {
    const { breweryUuid, brewhouseUuid } = req.params;
    console.log("brewhouseUuid:", brewhouseUuid)
    await brewhouseService.updateBrewhouse(
      breweryUuid,
      brewhouseUuid,
      validate.cleanRequestBody(req, { removeUndefined: true })
    );
    return res.locals.sendResponse(res);
  } catch (error) {
    console.log(error);
    return next(res.locals.opError("Brewhouse update failed", error));
  }
};

export const updateBrewhouse = [
  updateBrewhouseValidation,
  updateBrewhouseFunction,
];

// // updateBrewery
// /**
//  * @api {patch} /admin/breweries/:breweryUuid Update brewery (admin)
//  * @apiName UpdateBrewery
//  * @apiGroup Breweries
//  * @apiDescription Update a brewery's name or address
//  * @apiUse authHeader
//  * @apiParam {String} breweryId The brewery's unique identifier
//  * @apiBody {String} [name] A unique name for the brewery
//  * @apiBody {Object} [address] The brewery's physical address
//  * @apiBody {String} [address.street]
//  * @apiBody {String} [address.unit]
//  * @apiBody {String} [address.city]
//  * @apiBody {String{length: 2 characters}} [address.state]
//  * @apiBody {String} [address.zip]
//  * @apiBody {String} [address.country]
//  * @apiUse successResponse
//  * @apiSuccess {String} breweryId
//  */
// const updateBreweryValidation = [
//   validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
//   validate
//     .body("name")
//     .optional(opt)
//     .isString()
//     .isLength({ max: 30 })
//     .customSanitizer(validate.xssSanitize),
//   validate
//     .body("address.street")
//     .optional(opt)
//     .isString()
//     .isLength({ max: 100 })
//     .customSanitizer(validate.xssSanitize),
//   validate
//     .body("address.unit")
//     .optional(opt)
//     .isLength({ max: 50 })
//     .customSanitizer(validate.xssSanitize),
//   validate
//     .body("address.city")
//     .optional(opt)
//     .isString()
//     .isLength({ max: 50 })
//     .customSanitizer(validate.xssSanitize),
//   validate
//     .body("address.state")
//     .optional(opt)
//     .isAlpha()
//     .isLength({ min: 2, max: 2 }),
//   validate.body("address.zip").optional(opt).isString().isPostalCode("US"),
//   validate
//     .body("address.country")
//     .optional(opt)
//     .isString()
//     .isLength({ max: 30 })
//     .customSanitizer(validate.xssSanitize),
//   validate.catchValidationErrors,
// ];

// const updateBreweryFunction = async (req, res, next) => {
//   try {
//     const cleanedData = validate.cleanRequestBody(req);
//     if (!Object.keys(cleanedData).length) {
//       return next(res.locals.opError("Brewery update failed - empty request"));
//     }
//     await breweryService.updateBrewery(
//       req.params.breweryId,
//       validate.cleanRequestBody(req)
//     );
//     return res.locals.sendResponse(res);
//   } catch (error) {
//     return next(res.locals.opError("Brewery update failed", error));
//   }
// };

// export const updateBrewery = [updateBreweryValidation, updateBreweryFunction];

// // deleteBrewery
// /**
//  * @api {delete} /admin/breweries/:breweryId Delete brewery (admin)
//  * @apiName DeleteBrewery
//  * @apiGroup Breweries
//  * @apiDescription Delete a brewery
//  * @apiUse authHeader
//  * @apiParam {String} breweryId The brewery's unique identifier
//  * @apiUse successResponse
//  */
// const deleteBreweryValidation = [
//   validate
//     .param("breweryId")
//     .exists(opt)
//     .isString()
//     .isLength({ min: 2, max: 36 })
//     .custom(validate.xssSanitize),
//   validate.catchValidationErrors,
// ];

// const deleteBreweryFunction = async (req, res, next) => {
//   try {
//     await breweryService.deleteBrewery(req.params.breweryId);
//     return res.locals.sendResponse(res);
//   } catch (error) {
//     return next(res.locals.opError("Brewery deletion failed", error));
//   }
// };

// export const deleteBrewery = [deleteBreweryValidation, deleteBreweryFunction];
