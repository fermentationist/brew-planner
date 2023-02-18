import { isExistingUid } from "./users.js";
import * as fermentableService from "../services/fermentable.js";
import * as validate from "../middleware/input-validation.js";
import { isExistingBreweryUuid } from "./breweries.js";
import { inputError } from "../server/errors.js";
import { rejectOnFalse } from "../utils/helpers.js";

//validation helpers

const opt = { checkFalsy: true };
const numOpt = { no_symbols: true };

const validFermentableTypeChecker = input => fermentableService.FERMENTABLE_TYPES.includes(input);
const isValidFermentableType = rejectOnFalse(validFermentableTypeChecker);

const customFermentableNameValidator = async (req, res, next) => {
  // ensures that Fermentable name is unique (for the current brewery)
  const breweryUuid = req.params.breweryUuid;
  const { name } = req.body;
  const nameAlreadyExists =
    await fermentableService.isExistingFermentableAttribute(name, "name", {
      breweryUuid,
    });
  if (nameAlreadyExists) {
    return next(
      inputError([{ msg: "Invalid input", location: "body", param: "name" }])
    );
  }
  return next();
};

/**
 * @apiDefine Fermentables
 * @apiGroup Routes to administer fermentables
 */

/**
 * @api {get} breweries/:breweryUuid/fermentables Get fermentables
 * @apiName GetFermentables
 * @apiGroup Fermentables
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiDescription Get all of the fermentables for a specific brewery
 * @apiUse successResponse
 * @apiSuccess {Object[]} fermentables An array of fermentables objects, containing all the types of fermentables in the brewery
 */
 
const getFermentablesValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.catchValidationErrors,
];

const getFermentablesController = async (req, res, next) => {
  try {
    const fermentables = await fermentableService.getFermentables(
      req.params.breweryUuid
    );
    return res.locals.sendResponse(res, { fermentables });
  } catch (error) {
    return next(res.locals.opError("getFermentables request failed", error));
  }
};

export const getFermentables = [
  getFermentablesValidation,
  getFermentablesController,
];

// createFermentable
/**
 * @api {post} breweries/:breweryUuid/fermentables Create fermentable
 * @apiName CreateFermentable
 * @apiGroup Fermentables
 * @apiDescription Create a new fermentable
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiBody {String} name A name for the fermentable
 * @apiBody {String} [fermentableUuid] A unique identifier for the fermentable (a v1 UUID)
 * @apiBody {String} createdBy The uid of the user who created the fermentable
 * @apiBody {String} type One of "Grain", "Sugar", "Extract", "Dry Extract", or "Adjunct"
 * @apiBody {Number} yield Percentage soluable sugar by weight (whole number percentage, i.e. "33" = 33%)
 * @apiBody {Number} color Color contribution in SRM
 * @apiBody {String} [origin] Geographical origin
 * @apiBody {String} [supplier] Brand name of the supplier
 * @apiBody {Number} [coarseFineDiff] A (whole-number) percentage
 * @apiBody {Number} [moisture] - Percentage moisture by weight
 * @apiBody {Number} [diastaticPower] In degrees Lintner
 * @apiBody {Number} [protein] Percentage protein, by weight
 * @apiBody {Number} [maxInBatch] The recommended maximum percentage (by
 * @apiBody {Boolean} [recommendedMash] Whether or not the fermentable needs to be mashed
 * @apiBody {String} [notes]
 * @apiBody {Boolean} [addAfterBoil] Whether or not the fermentable should be added after the boil
 * @apiUse successResponse
 * @apiSuccess {String} brewhouseUuid
 */

const createFermentableValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate
    .body("name")
    .exists(opt)
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  customFermentableNameValidator,
  validate.body("fermentableUuid").optional(opt).isUUID(1),
  validate.body("createdBy").exists(opt).isString().custom(isExistingUid),
  validate.body("type").exists(opt).custom(isValidFermentableType),
  validate.body("yield").exists().isNumeric({min: 0, max: 100}).not().isString(),
  validate.body("color").exists().isNumeric({min: 0}).not().isString(),
  validate.body("origin").optional().isString().customSanitizer(validate.xssSanitize),
  validate.body("supplier").optional().isString().customSanitizer(validate.xssSanitize),
  validate.body("coarseFineDiff").optional().isNumeric({min: 0, max: 100}).not().isString(),
  validate.body("moisture").optional().isNumeric({min: 0, max: 100}).not().isString(),
  validate.body("diastaticPower").optional().isNumeric({min: 0}).not().isString(),
  validate.body("protein").optional().isNumeric({min: 0, max: 100}).not().isString(),
  validate.body("maxInBatch").optional().isNumeric({min: 0, max: 100}).not().isString(),
  validate.body("recommendedMash").optional().isBoolean(),
  validate.body("notes").optional().isString().customSanitizer(validate.xssSanitize),
  validate.body("addAfterBoil").optional().isBoolean(),
  validate.catchValidationErrors,
];

const createFermentableController = async (req, res, next) => {
  try {
    const fermentableUuid = await fermentableService.createFermentable(
      req.params.breweryUuid,
      validate.cleanRequestBody(req, { removeUndefined: true })
    );
    return res.locals.sendResponse(res, { fermentableUuid });
  } catch (error) {
    console.log(error);
    return next(res.locals.opError("Brewhouse creation failed", error));
  }
};

export const createFermentable = [
  createFermentableValidation,
  createFermentableController,
];