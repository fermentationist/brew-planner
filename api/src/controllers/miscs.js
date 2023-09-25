import { isExistingUid } from "./users.js";
import * as miscService from "../services/misc.js";
import * as validate from "../middleware/input-validation.js";
import { isExistingBreweryUuid } from "./breweries.js";
import { inputError } from "../server/errors.js";
import { rejectOnFalse } from "../utils/helpers.js";

//validation helpers

const opt = { checkFalsy: true };

const miscUuidChecker = (input) =>
  miscService.isExistingMiscAttribute(input, "miscUuid");
const isExistingMiscUuid = rejectOnFalse(miscUuidChecker);

const validMiscTypeChecker = (input) =>
  miscService.MISC_TYPES.includes(input);
const isValidMiscType = rejectOnFalse(validMiscTypeChecker);


const customMiscNameValidator = async (req, res, next) => {
  // ensures that Misc name is unique (for the current brewery)
  const { breweryUuid, miscUuid } = req.params;
  const { name } = req.body;
  const nameAlreadyExists = await miscService.isExistingMiscAttribute(
    name,
    "name",
    {
      breweryUuid,
    }
  );
  const nameBelongsToCurrentMisc =
    miscUuid &&
    (await miscService.isExistingMiscAttribute(name, "name", { miscUuid }));
  if (nameAlreadyExists && !nameBelongsToCurrentMisc) {
    return next(
      inputError([{ msg: "Invalid input", location: "body", param: "name" }])
    );
  }
  return next();
};

/**
 * @apiDefine Miscs
 * @apiGroup Routes to administer miscs
 */

/**
 * @api {get} breweries/:breweryUuid/miscs Get miscs
 * @apiName GetMiscs
 * @apiGroup Miscs
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiDescription Get all of the miscs for a specific brewery
 * @apiUse successResponse
 * @apiSuccess {Object[]} miscs An array of misc objects, containing all the varieties of miscs in the brewery
 */

const getMiscsValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.catchValidationErrors,
];

const getMiscsController = async (req, res, next) => {
  try {
    const miscs = await miscService.getMiscs(req.params.breweryUuid);
    return res.locals.sendResponse(res, { miscs });
  } catch (error) {
    return next(res.locals.opError("getMiscs request failed", error));
  }
};

export const getMiscs = [getMiscsValidation, getMiscsController];

// createMisc
/**
 * @api {post} breweries/:breweryUuid/miscs Create miscellaneous ingredient
 * @apiName CreateMisc
 * @apiGroup Miscs
 * @apiDescription Create a new miscellaneous ingredient
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiBody {String} name A unique name for the misc
 * @apiBody {String} [miscUuid] A unique identifier for the misc (a v1 UUID)
 * @apiBody {String} createdBy The uid of the user who created the misc
 * @apiBody {String} type One of: "Spice", "Fining", "Water Agent", "Herb", "Flavor" or "Other"
 * @apiBody {String} [useFor] Recommened use
 * @apiBody {String} [notes]
 * @apiUse successResponse
 * @apiSuccess {String} miscUuid
 */

const createMiscValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.body("miscUuid").optional(opt).isUUID(1),
  validate
    .body("name")
    .exists(opt)
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  customMiscNameValidator,
  validate.body("createdBy").exists(opt).isString().custom(isExistingUid),
  validate.body("type").exists(opt).custom(isValidMiscType),
  validate
    .body("useFor")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate
    .body("notes")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate.catchValidationErrors
];

const createMiscController = async (req, res, next) => {
  try {
    const miscUuid = await miscService.createMisc(
      req.params.breweryUuid,
      validate.cleanRequestBody(req, { removeUndefined: true })
    );
    return res.locals.sendResponse(res, { uuid: miscUuid });
  } catch (error) {
    console.log(error);
    return next(res.locals.opError("Misc creation failed", error));
  }
};

export const createMisc = [createMiscValidation, createMiscController];

// updateMisc
/**
 * @api {post} breweries/:breweryUuid/miscs/:miscUuid Update misc
 * @apiName UpdateMisc
 * @apiGroup Miscs
 * @apiDescription Update a misc
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} miscUuid A unique identifier for the misc (a v1 UUID)
 * @apiBody {String} [name] A unique name for the misc
 * @apiBody {String} [type] One of: "Spice", "Fining", "Water Agent", "Herb", "Flavor" or "Other"
 * @apiBody {String} [useFor] Recommened use
 * @apiBody {String} [notes]
 * @apiUse successResponse
 */

const updateMiscValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.param("miscUuid").exists(opt).custom(isExistingMiscUuid),
  validate
    .body("name")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  customMiscNameValidator,
  validate.body("type").optional().custom(isValidMiscType),
  validate
    .body("useFor")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate
    .body("notes")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate.catchValidationErrors,
];

const updateMiscController = async (req, res, next) => {
  try {
    const { breweryUuid, miscUuid } = req.params;
    await miscService.updateMisc(
      breweryUuid,
      miscUuid,
      validate.cleanRequestBody(req, { removeUndefined: true })
    );
    return res.locals.sendResponse(res);
  } catch (error) {
    console.log(error);
    return next(res.locals.opError("Misc update failed", error));
  }
};

export const updateMisc = [updateMiscValidation, updateMiscController];

// deleteMisc
/**
 * @api {delete} /breweries/:breweryUuid/miscs/:miscUuid Delete misc
 * @apiName DeleteMisc
 * @apiGroup Miscs
 * @apiDescription Delete a misc
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} miscUuid The misc's unique identifier
 * @apiUse successResponse
 */
const deleteMiscValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.param("miscUuid").exists(opt).custom(isExistingMiscUuid),
  validate.catchValidationErrors,
];

const deleteMiscController = async (req, res, next) => {
  try {
    await miscService.deleteMisc(
      req.params.breweryUuid,
      req.params.miscUuid
    );
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(res.locals.opError("Misc deletion failed", error));
  }
};

export const deleteMisc = [deleteMiscValidation, deleteMiscController];
