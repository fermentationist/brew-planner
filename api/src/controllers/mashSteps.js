import { isExistingUid } from "./users.js";
import * as mashStepService from "../services/mashStep.js";
import * as validate from "../middleware/input-validation.js";
import { isExistingBreweryUuid } from "./breweries.js";
import { inputError } from "../server/errors.js";
import { rejectOnFalse, numberValidator } from "../utils/helpers.js";

//validation helpers

const opt = { checkFalsy: true };

const mashStepTypeChecker = (input) => mashStepService.MASH_STEP_TYPES.includes(input);
const isValidMashStepType = rejectOnFalse(mashStepTypeChecker);

const mashUuidChecker = (input) =>
  mashStepService.isExistingMashStepAttribute(input, "mashUuid"); 
const isExistingMashUuid = rejectOnFalse(mashUuidChecker);

const mashStepUuidChecker = (input) =>
  mashStepService.isExistingMashStepAttribute(input, "mashStepUuid");
const isExistingMashStepUuid = rejectOnFalse(mashStepUuidChecker);

const isPositiveNumber = numberValidator({ min: 0 });

const customMashStepNameValidator = async (req, res, next) => {
  // ensures that MashStep name is unique (for the current brewery)
  const {mashStepUuid, mashUuid} = req.params;
  const { name } = req.body;
  const nameAlreadyExists =
    await mashStepService.isExistingMashStepAttribute(name, "name", {
      mashUuid
    });
  const nameBelongsToCurrentMashStep = mashStepUuid && await mashStepService.isExistingMashStepAttribute(name, "name", {mashStepUuid});
  if (nameAlreadyExists && !nameBelongsToCurrentMashStep) {
    return next(
      inputError([{ msg: "Invalid input", location: "body", param: "name" }])
    );
  }
  return next();
};

/**
 * @apiDefine MashSteps
 * @apiGroup Routes to administer mashSteps
 */

/**
 * @api {get} breweries/:breweryUuid/mashes/:mashUuid/mash_steps Get mashSteps
 * @apiName GetMashSteps
 * @apiGroup MashSteps
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} mashUuid The unique identifier for the mash
 * @apiDescription Get all of the mashSteps for a specific brewery and mash
 * @apiUse successResponse
 * @apiSuccess {Object[]} mashSteps An array of mashStep objects, containing all the varieties of mashSteps in the brewery
 */

const getMashStepsValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.param("mashUuid").exists(opt).custom(isExistingMashUuid),
  validate.catchValidationErrors,
];

const getMashStepsController = async (req, res, next) => {
  try {
    const mashSteps = await mashStepService.getMashSteps(
      req.params.breweryUuid,
      req.params.mashUuid
    );
    return res.locals.sendResponse(res, { mashSteps });
  } catch (error) {
    return next(res.locals.opError("getMashSteps request failed", error));
  }
};

export const getMashSteps = [
  getMashStepsValidation,
  getMashStepsController,
];

// createMashStep
/**
 * @api {post} breweries/:breweryUuid/mashes/:mashUuid/mash_steps Create mashStep
 * @apiName CreateMashStep
 * @apiGroup MashSteps
 * @apiDescription Create a new mashStep
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} mashUuid The unique identifier for the mash
 * @apiBody {String} name A name for the mashStep
 * @apiBody {String} [mashStepUuid] The unique identifier for the mashStep
 * @apiBody {String} createdBy The uid of the user who created the mashStep
 * @apiBody {String} type One of "Infusion", "Temperature" or "Decoction"
 * @apiBody {String} [infuseAmount] The amount of water to infuse (L)
 * @apiBody {Number} stepTemp The temperature of the mash step (ºC)
 * @apiBody {Number} stepTime The duration of the mash step (min)
 * @apiBody {Number} [rampTime] The time to reach the step temperature (min)
 * @apiBody {Number} [endTemp] The temperature you can expect the mash to fall to after this step (ºC)
 * @apiUse successResponse
 * @apiSuccess {String} mashStepUuid
 */

const createMashStepValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.param("mashUuid").exists(opt).custom(isExistingMashUuid),
  validate
    .body("name")
    .exists(opt)
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  customMashStepNameValidator,
  validate.body("mashStepUuid").optional(opt).isUUID(1),
  validate.body("createdBy").exists(opt).isString().custom(isExistingUid),
  validate.body("type").exists(opt).custom(isValidMashStepType),
  validate.body("infuseAmount").optional().custom(isPositiveNumber),
  validate.body("stepTemp").exists(opt).custom(numberValidator()),
  validate.body("stepTime").exists(opt).isInt({ min: 0 }),
  validate.body("rampTime").optional().isInt({ min: 0 }),
  validate.body("endTemp").optional().custom(isPositiveNumber),
  validate.catchValidationErrors,
];

const createMashStepController = async (req, res, next) => {
  try {
    const mashStepUuid = await mashStepService.createMashStep(
      req.params.breweryUuid,
      req.params.mashUuid,
      validate.cleanRequestBody(req, { removeUndefined: true })
    );
    return res.locals.sendResponse(res, { uuid: mashStepUuid });
  } catch (error) {
    return next(res.locals.opError("Mash step creation failed", error));
  }
};

export const createMashStep = [
  createMashStepValidation,
  createMashStepController,
];


// updateMashStep
/**
 * @api {post} breweries/:breweryUuid/mashes/:mashUuid/mash_steps/:mashStepUuid Update mashStep
 * @apiName UpdateMashStep
 * @apiGroup MashSteps
 * @apiDescription Update a mashStep
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} mashUuid The unique identifier for the mash
 * @apiParam {String} mashStepUuid The unique identifier for the mashStep
 * @apiBody {String} [name] A name for the mashStep
 * @apiBody {String} [createdBy] The uid of the user who created the mashStep
 * @apiBody {String} [type] One of "Infusion", "Temperature" or "Decoction"
 * @apiBody {String} [infuseAmount] The amount of water to infuse (L)
 * @apiBody {Number} [stepTemp] The temperature of the mash step (ºC)
 * @apiBody {Number} [stepTime] The duration of the mash step (min)
 * @apiBody {Number} [rampTime] The time to reach the step temperature (min)
 * @apiBody {Number} [endTemp] The temperature you can expect the mash to fall 
 * @apiUse successResponse
 */

const updateMashStepValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.param("mashUuid").exists(opt).custom(isExistingMashUuid),
  validate
    .param("mashStepUuid")
    .exists(opt)
    .custom(isExistingMashStepUuid),
  validate
    .body("name")
    .exists(opt)
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  customMashStepNameValidator,
  validate.body("mashStepUuid").optional(opt).isUUID(1),
  validate.body("createdBy").optional().isString().custom(isExistingUid),
  validate.body("type").optional().custom(isValidMashStepType),
  validate.body("infuseAmount").optional().custom(isPositiveNumber),
  validate.body("stepTemp").optional().custom(numberValidator()),
  validate.body("stepTime").optional().isInt({ min: 0 }),
  validate.body("rampTime").optional().isInt({ min: 0 }),
  validate.body("endTemp").optional().custom(isPositiveNumber),
  validate.catchValidationErrors,
];

const updateMashStepController = async (req, res, next) => {
  try {
    const { breweryUuid, mashUuid, mashStepUuid } = req.params;
    await mashStepService.updateMashStep(
      breweryUuid,
      mashUuid,
      mashStepUuid,
      validate.cleanRequestBody(req, { removeUndefined: true })
    );
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(res.locals.opError("Mash step update failed", error));
  }
};

export const updateMashStep = [updateMashStepValidation, updateMashStepController];

// deleteMashStep
/**
 * @api {delete} /breweries/:breweryUuid/mashes/:mashUuid/mash_steps/:mashStepUuid Delete mashStep
 * @apiName DeleteMashStep
 * @apiGroup MashSteps
 * @apiDescription Delete a mashStep
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} mashUuid The unique identifier for the mash
 * @apiParam {String} mashStepUuid The mashStep's unique identifier
 * @apiUse successResponse
 */
const deleteMashStepValidation = [
  validate
    .param("breweryUuid")
    .exists(opt)
    .custom(isExistingBreweryUuid),
  validate
    .param("mashUuid")
    .exists(opt)
    .custom(isExistingMashUuid),
  validate
    .param("mashStepUuid")
    .exists(opt)
    .custom(isExistingMashStepUuid),
  validate.catchValidationErrors,
];

const deleteMashStepController = async (req, res, next) => {
  try {
    const { 
      mashStepUuid,
      mashUuid,
      breweryUuid
    } = req.params;
    await mashStepService.deleteMashStep(breweryUuid, mashUuid, mashStepUuid);
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(res.locals.opError("Mash step deletion failed", error));
  }
};

export const deleteMashStep = [deleteMashStepValidation, deleteMashStepController];