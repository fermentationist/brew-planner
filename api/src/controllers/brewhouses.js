import * as brewhouseService from "../services/brewhouse.js";
import { isExistingBreweryUuid } from "./breweries.js";
import * as validate from "../middleware/input-validation.js";
import { isExistingUid } from "./users.js";
import { rejectOnFalse, numberValidator } from "../utils/helpers.js";
import { inputError } from "../server/errors.js";

//validation helpers

const opt = { checkFalsy: true };
const numOpt = { no_symbols: true };

const brewhouseUuidChecker = (input) => brewhouseService.isExistingBrewhouseAttribute(input, "brewhouseUuid");

const isExistingBrewhouseUuid = rejectOnFalse(brewhouseUuidChecker);

const customBrewhouseNameValidator = async (req, res, next) => {
  // ensures that brewhouse name is unique (for the current brewery)
  const breweryUuid = req.params.breweryUuid;
  const {name} = req.body;
  const nameAlreadyExists = await brewhouseService.isExistingBrewhouseAttribute(name, "name", {breweryUuid});
  if (nameAlreadyExists) {
    return next(inputError([{msg: "Invalid input", location: "body", param: "name"}]));
  }
  return next();
}

// getBrewhouses
/**
 * @api {get} breweries/:breweryUuid/brewhouses Get brewhouses
 * @apiName GetBrewhouses
 * @apiGroup Brewhouses
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
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
    return next(res.locals.opError("getBrewhouses request failed", error));
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
 * @apiBody {String} [brewhouseUuid] A unique identifier for the brewhouse (a v1 UUID)
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
  validate
    .body("name")
    .exists()
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  customBrewhouseNameValidator,
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.body("brewhouseUuid").optional(opt).isUUID(1),
  validate.body("createdBy").exists(opt).isString().custom(isExistingUid),
  validate.body("batchSize").exists().custom(numberValidator({min: 0})),
  validate.body("tunVolume").exists().custom(numberValidator({min: 0})),
  validate.body("tunWeight").exists().custom(numberValidator({min: 0})),
  validate.body("tunLoss").optional().custom(numberValidator({min: 0})),
  validate.body("tunSpecificHeat").exists().custom(numberValidator({min: 0})),
  validate.body("lauterDeadspace").optional().custom(numberValidator({min: 0})),
  validate.body("topUpWater").optional().custom(numberValidator({min: 0})),
  validate.body("trubChillerLoss").optional().custom(numberValidator({min: 0})),
  validate.body("evaporationRate").exists().custom(numberValidator({min: 0})),
  validate.body("kettleVol").exists().custom(numberValidator({min: 0})),
  validate.body("miscLoss").optional().custom(numberValidator({min: 0})),
  validate.body("extractEfficiency").exists().custom(numberValidator({min: 0})),
  validate.body("grainAbsorptionRate").exists().custom(numberValidator({min: 0})),
  validate.body("hopUtilization").exists().custom(numberValidator({min: 0})),
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
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  validate.body("batchSize").optional().custom(numberValidator({min: 0})),
  validate.body("tunVolume").optional().custom(numberValidator({min: 0})),
  validate.body("tunWeight").optional().custom(numberValidator({min: 0})),
  validate.body("tunLoss").optional().custom(numberValidator({min: 0})),
  validate.body("tunSpecificHeat").optional().custom(numberValidator({min: 0})),
  validate.body("lauterDeadspace").optional().custom(numberValidator({min: 0})),
  validate.body("topUpWater").optional().custom(numberValidator({min: 0})),
  validate.body("trubChillerLoss").optional().custom(numberValidator({min: 0})),
  validate.body("evaporationRate").optional().custom(numberValidator({min: 0})),
  validate.body("kettleVol").optional().custom(numberValidator({min: 0})),
  validate.body("miscLoss").optional().custom(numberValidator({min: 0})),
  validate.body("extractEfficiency").optional().custom(numberValidator({min: 0})),
  validate.body("grainAbsorptionRate").optional().custom(numberValidator({min: 0})),
  validate.body("hopUtilization").optional().custom(numberValidator({min: 0})),
  validate.catchValidationErrors,
];

const updateBrewhouseFunction = async (req, res, next) => {
  try {
    const { breweryUuid, brewhouseUuid } = req.params;
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

// deleteBrewhouse
/**
 * @api {delete} /breweries/:breweryUuid/brewhouses/:brewhouseUuid Delete brewery (admin)
 * @apiName DeleteBrewhouse
 * @apiGroup Brewhouses
 * @apiDescription Delete a brewhouse
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} brewhouseUuid The brewhouse's unique identifier
 * @apiUse successResponse
 */
const deleteBrewhouseValidation = [
  validate
    .param("breweryUuid")
    .exists(opt)
    .custom(isExistingBreweryUuid),
  validate
    .param("brewhouseUuid")
    .exists(opt)
    .custom(isExistingBrewhouseUuid),
  validate.catchValidationErrors,
];

const deleteBrewhouseFunction = async (req, res, next) => {
  try {
    await brewhouseService.deleteBrewhouse(req.params.breweryUuid, req.params.brewhouseUuid);
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(res.locals.opError("Brewhouse deletion failed", error));
  }
};

export const deleteBrewhouse = [deleteBrewhouseValidation, deleteBrewhouseFunction];