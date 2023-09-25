import { isExistingUid } from "./users.js";
import * as waterService from "../services/water.js";
import * as validate from "../middleware/input-validation.js";
import { isExistingBreweryUuid } from "./breweries.js";
import { inputError } from "../server/errors.js";
import { rejectOnFalse, numberValidator } from "../utils/helpers.js";

//validation helpers

const opt = { checkFalsy: true };
const numOpt = { no_symbols: true };

const waterUuidChecker = (input) =>
  waterService.isExistingWaterAttribute(input, "waterUuid");
const isExistingWaterUuid = rejectOnFalse(waterUuidChecker);

const customWaterNameValidator = async (req, res, next) => {
  // ensures that Water name is unique (for the current brewery)
  const {breweryUuid, waterUuid} = req.params;
  const { name } = req.body;
  const nameAlreadyExists =
    await waterService.isExistingWaterAttribute(name, "name", {
      breweryUuid,
    });
  const nameBelongsToCurrentWater = waterUuid && await waterService.isExistingWaterAttribute(name, "name", {waterUuid});
  if (nameAlreadyExists && !nameBelongsToCurrentWater) {
    return next(
      inputError([{ msg: "Invalid input", location: "body", param: "name" }])
    );
  }
  return next();
};

/**
 * @apiDefine Waters
 * @apiGroup Routes to administer waters
 */

/**
 * @api {get} breweries/:breweryUuid/waters Get waters
 * @apiName GetWaters
 * @apiGroup Waters
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiDescription Get all of the waters for a specific brewery
 * @apiUse successResponse
 * @apiSuccess {Object[]} waters An array of water objects, containing all the varieties of waters in the brewery
 */

const getWatersValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.catchValidationErrors,
];

const getWatersController = async (req, res, next) => {
  try {
    const waters = await waterService.getWaters(
      req.params.breweryUuid
    );
    return res.locals.sendResponse(res, { waters });
  } catch (error) {
    return next(res.locals.opError("getWaters request failed", error));
  }
};

export const getWaters = [
  getWatersValidation,
  getWatersController,
];

// createWaters
/**
 * @api {post} breweries/:breweryUuid/waters Create water
 * @apiName CreateWater
 * @apiGroup Waters
 * @apiDescription Create a new water
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiBody {String} name A name for the water
 * @apiBody {String} [waterUuid] A unique identifier for the water (a v1 UUID)
 * @apiBody {String} createdBy The uid of the user who created the water
 * @apiBody {Number} [calcium] Parts per million (ppm)
 * @apiBody {Number} [bicarbonate] Parts per million (ppm)
 * @apiBody {Number} [sulfate] Parts per million (ppm)
 * @apiBody {Number} [chloride] Parts per million (ppm)
 * @apiBody {Number} [sodium] Parts per million (ppm)
 * @apiBody {Number} [magnesium] Parts per million (ppm)
 * @apiBody {Number} [ph] pH
 * @apiBody {String} [notes]
 * @apiUse successResponse
 * @apiSuccess {String} waterUuid
 */

const createWaterValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate
    .body("name")
    .exists(opt)
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  customWaterNameValidator,
  validate.body("waterUuid").optional(opt).isUUID(1),
  validate.body("createdBy").exists(opt).isString().custom(isExistingUid),
  validate.body("calcium").optional().custom(numberValidator({min: 0})),
  validate.body("bicarbonate").optional().custom(numberValidator({min: 0})),
  validate.body("sulfate").optional().custom(numberValidator({min: 0})),
  validate.body("chloride").optional().custom(numberValidator({min: 0})),
  validate.body("sodium").optional().custom(numberValidator({min: 0})),
  validate.body("magnesium").optional().custom(numberValidator({min: 0})),
  validate.body("ph").optional().custom(numberValidator({min: 0})),
  validate
    .body("notes")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate.catchValidationErrors,
];

const createWaterController = async (req, res, next) => {
  try {
    const waterUuid = await waterService.createWater(
      req.params.breweryUuid,
      validate.cleanRequestBody(req, { removeUndefined: true })
    );
    return res.locals.sendResponse(res, { uuid: waterUuid });
  } catch (error) {
    console.log(error);
    return next(res.locals.opError("Water creation failed", error));
  }
};

export const createWater = [
  createWaterValidation,
  createWaterController,
];


// updateWater
/**
 * @api {post} breweries/:breweryUuid/waters/:waterUuid Update water
 * @apiName UpdateWater
 * @apiGroup Waters
 * @apiDescription Update a water
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} waterUuid The brewery's unique identifier
 * @apiBody {String} [name] A name for the water
 * @apiBody {Number} [calcium] Parts per million (ppm)
 * @apiBody {Number} [bicarbonate] Parts per million (ppm)
 * @apiBody {Number} [sulfate] Parts per million (ppm)
 * @apiBody {Number} [chloride] Parts per million (ppm)
 * @apiBody {Number} [sodium] Parts per million (ppm)
 * @apiBody {Number} [magnesium] Parts per million (ppm)
 * @apiBody {Number} [ph] pH
 * @apiBody {String} [notes]
 * @apiUse successResponse
 */

const updateWaterValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate
    .param("waterUuid")
    .exists(opt)
    .custom(isExistingWaterUuid),
  validate
    .body("name")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  customWaterNameValidator,
  validate.body("waterUuid").optional(opt).isUUID(1),
  validate.body("calcium").optional().custom(numberValidator({min: 0})),
  validate.body("bicarbonate").optional().custom(numberValidator({min: 0})),
  validate.body("sulfate").optional().custom(numberValidator({min: 0})),
  validate.body("chloride").optional().custom(numberValidator({min: 0})),
  validate.body("sodium").optional().custom(numberValidator({min: 0})),
  validate.body("magnesium").optional().custom(numberValidator({min: 0})),
  validate.body("ph").optional().custom(numberValidator({min: 0})),
  validate
    .body("notes")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate.catchValidationErrors,
];

const updateWaterController = async (req, res, next) => {
  try {
    const { breweryUuid, waterUuid } = req.params;
    await waterService.updateWater(
      breweryUuid,
      waterUuid,
      validate.cleanRequestBody(req, { removeUndefined: true })
    );
    return res.locals.sendResponse(res);
  } catch (error) {
    console.log(error)
    return next(res.locals.opError("Water update failed", error));
  }
};

export const updateWater = [updateWaterValidation, updateWaterController];

// deleteWater
/**
 * @api {delete} /breweries/:breweryUuid/waters/:waterUuid Delete water
 * @apiName DeleteWater
 * @apiGroup Waters
 * @apiDescription Delete a water
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} waterUuid The water's unique identifier
 * @apiUse successResponse
 */
const deleteWaterValidation = [
  validate
    .param("breweryUuid")
    .exists(opt)
    .custom(isExistingBreweryUuid),
  validate
    .param("waterUuid")
    .exists(opt)
    .custom(isExistingWaterUuid),
  validate.catchValidationErrors,
];

const deleteWaterController = async (req, res, next) => {
  try {
    await waterService.deleteWater(req.params.breweryUuid, req.params.waterUuid);
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(res.locals.opError("Water deletion failed", error));
  }
};

export const deleteWater = [deleteWaterValidation, deleteWaterController];