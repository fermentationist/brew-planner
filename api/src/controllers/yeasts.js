import { isExistingUid } from "./users.js";
import * as yeastService from "../services/yeast.js";
import * as validate from "../middleware/input-validation.js";
import { isExistingBreweryUuid } from "./breweries.js";
import { inputError } from "../server/errors.js";
import { rejectOnFalse, numberValidator } from "../utils/helpers.js";

//validation helpers

const opt = { checkFalsy: true };
const numOpt = { no_symbols: true };

const yeastUuidChecker = (input) =>
  yeastService.isExistingYeastAttribute(input, "yeastUuid");
const isExistingYeastUuid = rejectOnFalse(yeastUuidChecker);

const validYeastTypeChecker = (input) =>
  yeastService.YEAST_TYPES.includes(input);
const isValidYeastType = rejectOnFalse(validYeastTypeChecker);

const validFlocculationTypeChecker = (input) =>
  yeastService.FLOCCULATION_TYPES.includes(input);
const isValidFlocculationType = rejectOnFalse(validFlocculationTypeChecker);

const isPercentage = numberValidator({ min: 0, max: 100 });

const customYeastNameValidator = async (req, res, next) => {
  // ensures that Yeast name is unique (for the current brewery)
  const { breweryUuid, yeastUuid } = req.params;
  const { name } = req.body;
  const nameAlreadyExists = await yeastService.isExistingYeastAttribute(
    name,
    "name",
    {
      breweryUuid,
    }
  );
  const nameBelongsToCurrentYeast =
    yeastUuid &&
    (await yeastService.isExistingYeastAttribute(name, "name", { yeastUuid }));
  if (nameAlreadyExists && !nameBelongsToCurrentYeast) {
    return next(
      inputError([{ msg: "Invalid input", location: "body", param: "name" }])
    );
  }
  return next();
};

/**
 * @apiDefine Yeasts
 * @apiGroup Routes to administer yeasts
 */

/**
 * @api {get} breweries/:breweryUuid/yeasts Get yeasts
 * @apiName GetYeasts
 * @apiGroup Yeasts
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiDescription Get all of the yeasts for a specific brewery
 * @apiUse successResponse
 * @apiSuccess {Object[]} yeasts An array of yeast objects, containing all the varieties of yeasts in the brewery
 */

const getYeastsValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.catchValidationErrors,
];

const getYeastsController = async (req, res, next) => {
  try {
    const yeasts = await yeastService.getYeasts(req.params.breweryUuid);
    return res.locals.sendResponse(res, { yeasts });
  } catch (error) {
    return next(res.locals.opError("getYeasts request failed", error));
  }
};

export const getYeasts = [getYeastsValidation, getYeastsController];

// createYeast
/**
 * @api {post} breweries/:breweryUuid/yeasts Create yeast
 * @apiName CreateYeast
 * @apiGroup Yeasts
 * @apiDescription Create a new yeast
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiBody {String} name A name for the yeast
 * @apiBody {String} [yeastUuid] A unique identifier for the yeast (a v1 UUID)
 * @apiBody {String} createdBy The uid of the user who created the yeast
 * @apiBody {String} type One of: "Ale", "Lager", "Wheat", "Wine", "Champagne" or "Kveik"
 * @apiBody {String} [laboratory] The name of the laboratory (brand) that produced the yeast
 * @apiBody {String} [productId] The manufacturer's product id, i.e. WLP001
 * @apiBody {Number} [minTemperature] Minimum recommended fermentation temperature in degrees Celcius
 * @apiBody {Number} [maxTemperature] Maximum recommended fermentation temperature in degrees Celcius
 * @apiBody {String} [flocculation] One of: "Low", "Medium", "High" or "Very High"
 * @apiBody {Number} [attenuation] A percentage
 * (whole number) -  the average attenuation for the strain
 * @apiBody {String} [notes]
 * @apiBody {String} [bestFor] Styles the yeast is recommended for
 * @apiBody {Number} [maxReuse] An integer - the recommended maximum number of times a yeast may be repitched
 * @apiUse successResponse
 * @apiSuccess {String} yeastUuid
 */

const createYeastValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.body("yeastUuid").optional(opt).isUUID(1),
  validate
    .body("name")
    .exists(opt)
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  customYeastNameValidator,
  validate.body("createdBy").exists(opt).isString().custom(isExistingUid),
  validate.body("type").exists(opt).custom(isValidYeastType),
  validate
    .body("laboratory")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("productId")
    .optional()
    .isString()
    .isLength({ min: 1, max: 36 })
    .customSanitizer(validate.xssSanitize),
  validate.body("minTemperature").optional().custom(numberValidator()),
  validate.body("maxTemperature").optional().custom(numberValidator()),
  validate.body("flocculation").optional().custom(isValidFlocculationType),
  validate.body("attenuation").optional().custom(isPercentage),
  validate
    .body("notes")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate
    .body("bestFor")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate
    .body("maxReuse")
    .optional()
    .isInt()
    .custom(numberValidator({min: 0})),
  validate.catchValidationErrors
];

const createYeastController = async (req, res, next) => {
  try {
    const yeastUuid = await yeastService.createYeast(
      req.params.breweryUuid,
      validate.cleanRequestBody(req, { removeUndefined: true })
    );
    return res.locals.sendResponse(res, { uuid: yeastUuid });
  } catch (error) {
    console.log(error);
    return next(res.locals.opError("Yeast creation failed", error));
  }
};

export const createYeast = [createYeastValidation, createYeastController];

// updateYeast
/**
 * @api {post} breweries/:breweryUuid/yeasts/:yeastUuid Update yeast
 * @apiName UpdateYeast
 * @apiGroup Yeasts
 * @apiDescription Update a yeast
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} yeastUuid A unique identifier for the yeast (a v1 UUID)
 * @apiBody {String} [name] A name for the yeast
 * @apiBody {String} [type] One of: "Ale", "Lager", "Wheat", "Wine", "Champagne" or "Kveik"
 * @apiBody {String} [laboratory] The name of the laboratory (brand) that produced the yeast
 * @apiBody {String} [productId] The manufacturer's product id, i.e. WLP001
 * @apiBody {Number} [minTemperature] Minimum recommended fermentation temperature in degrees Celcius
 * @apiBody {Number} [maxTemperature] Maximum recommended fermentation temperature in degrees Celcius
 * @apiBody {String} [flocculation] One of: "Low", "Medium", "High" or "Very High"
 * @apiBody {Number} [attenuation] A percentage
 * (whole number) -  the average attenuation for the strain
 * @apiBody {String} [notes]
 * @apiBody {String} [bestFor] Styles the yeast is recommended for
 * @apiBody {Number} [maxReuse] An integer - the recommended maximum number of times a yeast may be repitched
 * @apiUse successResponse
 */

const updateYeastValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.param("yeastUuid").exists(opt).custom(isExistingYeastUuid),
  validate
    .body("name")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  customYeastNameValidator,
  validate.body("type").optional().custom(isValidYeastType),
  validate
    .body("laboratory")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("productId")
    .optional()
    .isString()
    .isLength({ min: 1, max: 36 })
    .customSanitizer(validate.xssSanitize),
  validate.body("minTemperature").optional().custom(numberValidator()),
  validate.body("maxTemperature").optional().custom(numberValidator()),
  validate.body("flocculation").optional().custom(isValidFlocculationType),
  validate.body("attenuation").optional().custom(isPercentage),
  validate
    .body("notes")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate
    .body("bestFor")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate
    .body("maxReuse")
    .optional()
    .isInt()
    .custom(numberValidator({min: 0})),
  validate.catchValidationErrors,
];

const updateYeastController = async (req, res, next) => {
  try {
    const { breweryUuid, yeastUuid } = req.params;
    await yeastService.updateYeast(
      breweryUuid,
      yeastUuid,
      validate.cleanRequestBody(req, { removeUndefined: true })
    );
    return res.locals.sendResponse(res);
  } catch (error) {
    console.log(error);
    return next(res.locals.opError("Yeast update failed", error));
  }
};

export const updateYeast = [updateYeastValidation, updateYeastController];

// deleteYeast
/**
 * @api {delete} /breweries/:breweryUuid/yeasts/:yeastUuid Delete yeast
 * @apiName DeleteYeast
 * @apiGroup Yeasts
 * @apiDescription Delete a yeast
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} yeastUuid The yeast's unique identifier
 * @apiUse successResponse
 */
const deleteYeastValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.param("yeastUuid").exists(opt).custom(isExistingYeastUuid),
  validate.catchValidationErrors,
];

const deleteYeastController = async (req, res, next) => {
  try {
    await yeastService.deleteYeast(
      req.params.breweryUuid,
      req.params.yeastUuid
    );
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(res.locals.opError("Yeast deletion failed", error));
  }
};

export const deleteYeast = [deleteYeastValidation, deleteYeastController];
