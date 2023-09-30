import * as mashService from "../services/mash.js";
import * as validate from "../middleware/input-validation.js";
import { isExistingBreweryUuid } from "./breweries.js";
import { inputError } from "../server/errors.js";
import { rejectOnFalse, numberValidator } from "../utils/helpers.js";

//validation helpers

const opt = { checkFalsy: true };

const mashUuidChecker = (input) =>
  mashService.isExistingMashAttribute(input, "mashUuid");
const isExistingMashUuid = rejectOnFalse(mashUuidChecker);

const isPositiveNumber = numberValidator({ min: 0 });

const customMashNameValidator = async (req, res, next) => {
  // ensures that Mash name is unique (for the current brewery)
  const {breweryUuid, mashUuid} = req.params;
  const { name } = req.body;
  const nameAlreadyExists =
    await mashService.isExistingMashAttribute(name, "name", {
      breweryUuid,
    });
  const nameBelongsToCurrentMash = mashUuid && await mashService.isExistingMashAttribute(name, "name", {mashUuid});
  if (nameAlreadyExists && !nameBelongsToCurrentMash) {
    return next(
      inputError([{ msg: "Invalid input", location: "body", param: "name" }])
    );
  }
  return next();
};

/**
 * @apiDefine Mashes
 * @apiGroup Routes to administer mashes
 */

/**
 * @api {get} breweries/:breweryUuid/mashes Get mashes
 * @apiName GetMashes
 * @apiGroup Mashes
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiDescription Get all of the mashes for a specific brewery
 * @apiUse successResponse
 * @apiSuccess {Object[]} mashes An array of mash objects, containing all the varieties of mashes in the brewery
 */

const getMashesValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.catchValidationErrors,
];

const getMashesController = async (req, res, next) => {
  try {
    const mashes = await mashService.getMashes(
      req.params.breweryUuid
    );
    return res.locals.sendResponse(res, { mashes });
  } catch (error) {
    return next(res.locals.opError("getMashes request failed", error));
  }
};

export const getMashes = [
  getMashesValidation,
  getMashesController,
];

// createMash
/**
 * @api {post} breweries/:breweryUuid/mashes Create mash
 * @apiName CreateMash
 * @apiGroup Mashes
 * @apiDescription Create a new mash
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiBody {String} name A name for the mash
 * @apiBody {String} [mashUuid] A unique identifier for the mash (a v1 UUID)
 * @apiBody {Number} [grainTemp] The temperature of the grain (ºC)
 * @apiBody {Number} [tunTemp] The temperature of the mash tun (ºC)
 * @apiBody {Number} [spargeTemp] The temperature of the sparge water (ºC)
 * @apiBody {Number} [ph] The (target?) pH of the mash
 * @apiBody {Number} [tunWeight] The weight of the mash tun (kg)
 * @apiBody {Number} [tunSpecificHeat] The specific heat of the mash tun (cal/g/ºC)
 * @apiBody {Boolean} [equipAdjust] Whether to adjust for equipment temperature
 * @apiBody {String} [notes]
 * @apiUse successResponse
 * @apiSuccess {String} mashUuid
 */

const createMashValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate
    .body("name")
    .exists(opt)
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  customMashNameValidator,
  validate.body("mashUuid").optional(opt).isUUID(1),
  validate.body("grainTemp").optional().custom(numberValidator()),
  validate.body("tunTemp").optional().custom(numberValidator()),
  validate.body("spargeTemp").optional().custom(isPositiveNumber),
  validate.body("ph").optional().custom(isPositiveNumber),
  validate.body("tunWeight").optional().custom(isPositiveNumber),
  validate.body("tunSpecificHeat").optional().custom(isPositiveNumber),
  validate.body("equipAdjust").optional().isBoolean({strict: true}),
  validate
    .body("notes")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate.catchValidationErrors,
];

const createMashController = async (req, res, next) => {
  try {
    const mashUuid = await mashService.createMash(
      req.params.breweryUuid,
      {
        ...validate.cleanRequestBody(req, { removeUndefined: true }),
        createdBy: res.locals.user.uid,
      }
    );
    return res.locals.sendResponse(res, { uuid: mashUuid });
  } catch (error) {
    return next(res.locals.opError("Mash creation failed", error));
  }
};

export const createMash = [
  createMashValidation,
  createMashController,
];


// updateMash
/**
 * @api {post} breweries/:breweryUuid/mashes/:mashUuid Update mash
 * @apiName UpdateMash
 * @apiGroup Mashes
 * @apiDescription Update a mash
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} mashUuid The unique identifier for the mash
 * @apiBody {String} [name] A name for the mash
 * @apiBody {Number} [grainTemp] The temperature of the grain (ºC)
 * @apiBody {Number} [tunTemp] The temperature of the mash tun (ºC)
 * @apiBody {Number} [spargeTemp] The temperature of the sparge water (ºC)
 * @apiBody {Number} [ph] The (target?) pH of the mash
 * @apiBody {Number} [tunWeight] The weight of the mash tun (kg)
 * @apiBody {Number} [tunSpecificHeat] The specific heat of the mash tun (cal/g/ºC)
 * @apiBody {Boolean} [equipAdjust] Whether to adjust for equipment temperature
 * @apiBody {String} [notes]
 * @apiUse successResponse
 */

const updateMashValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate
    .param("mashUuid")
    .exists(opt)
    .custom(isExistingMashUuid),
  validate
    .body("name")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  customMashNameValidator,
  validate.body("grainTemp").optional().custom(numberValidator()),
  validate.body("tunTemp").optional().custom(numberValidator()),
  validate.body("spargeTemp").optional().custom(isPositiveNumber),
  validate.body("ph").optional().custom(isPositiveNumber),
  validate.body("tunWeight").optional().custom(isPositiveNumber),
  validate.body("tunSpecificHeat").optional().custom(isPositiveNumber),
  validate.body("equipAdjust").optional().isBoolean({strict: true}),
  validate
    .body("notes")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate.catchValidationErrors,
];

const updateMashController = async (req, res, next) => {
  try {
    const { breweryUuid, mashUuid } = req.params;
    await mashService.updateMash(
      breweryUuid,
      mashUuid,
      validate.cleanRequestBody(req, { removeUndefined: true })
    );
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(res.locals.opError("Mash update failed", error));
  }
};

export const updateMash = [updateMashValidation, updateMashController];

// deleteMash
/**
 * @api {delete} /breweries/:breweryUuid/mashes/:mashUuid Delete mash
 * @apiName DeleteMash
 * @apiGroup Mashes
 * @apiDescription Delete a mash
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} mashUuid The mash's unique identifier
 * @apiUse successResponse
 */
const deleteMashValidation = [
  validate
    .param("breweryUuid")
    .exists(opt)
    .custom(isExistingBreweryUuid),
  validate
    .param("mashUuid")
    .exists(opt)
    .custom(isExistingMashUuid),
  validate.catchValidationErrors,
];

const deleteMashController = async (req, res, next) => {
  try {
    await mashService.deleteMash(req.params.breweryUuid, req.params.mashUuid);
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(res.locals.opError("Mash deletion failed", error));
  }
};

export const deleteMash = [deleteMashValidation, deleteMashController];