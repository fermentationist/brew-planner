import { isExistingUid } from "./users.js";
import * as hopService from "../services/hop.js";
import * as validate from "../middleware/input-validation.js";
import { isExistingBreweryUuid } from "./breweries.js";
import { inputError } from "../server/errors.js";
import { rejectOnFalse, numberValidator } from "../utils/helpers.js";

//validation helpers

const opt = { checkFalsy: true };
const numOpt = { no_symbols: true };

const hopUuidChecker = (input) =>
  hopService.isExistingHopAttribute(input, "hopUuid");
const isExistingHopUuid = rejectOnFalse(hopUuidChecker);

const isPercentage = numberValidator({ min: 0, max: 100 });

const validHopFormChecker = (input) =>
  hopService.HOP_FORMS.includes(input);
const isValidHopForm = rejectOnFalse(validHopFormChecker);

const customHopNameValidator = async (req, res, next) => {
  // ensures that Hop name is unique (for the current brewery)
  const {breweryUuid, hopUuid} = req.params;
  const { name } = req.body;
  const nameAlreadyExists =
    await hopService.isExistingHopAttribute(name, "name", {
      breweryUuid,
    });
  const nameBelongsToCurrentHop = hopUuid && await hopService.isExistingHopAttribute(name, "name", {hopUuid});
  if (nameAlreadyExists && !nameBelongsToCurrentHop) {
    return next(
      inputError([{ msg: "Invalid input", location: "body", param: "name" }])
    );
  }
  return next();
};

/**
 * @apiDefine Hops
 * @apiGroup Routes to administer hops
 */

/**
 * @api {get} breweries/:breweryUuid/hops Get hops
 * @apiName GetHops
 * @apiGroup Hops
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiDescription Get all of the hops for a specific brewery
 * @apiUse successResponse
 * @apiSuccess {Object[]} hops An array of hop objects, containing all the varieties of hops in the brewery
 */

const getHopsValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.catchValidationErrors,
];

const getHopsController = async (req, res, next) => {
  try {
    const hops = await hopService.getHops(
      req.params.breweryUuid
    );
    return res.locals.sendResponse(res, { hops });
  } catch (error) {
    return next(res.locals.opError("getHops request failed", error));
  }
};

export const getHops = [
  getHopsValidation,
  getHopsController,
];

// createHop
/**
 * @api {post} breweries/:breweryUuid/hops Create hop
 * @apiName CreateHop
 * @apiGroup Hops
 * @apiDescription Create a new hop
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiBody {String} name A name for the hop
 * @apiBody {String} [hopUuid] A unique identifier for the hop (a v1 UUID)
 * @apiBody {String} createdBy The uid of the user who created the hop
 * @apiBody {Number} alpha Percentage Alpha Acids by weight (a whole-number percentage)
 * @apiBody {Number} [beta] Percentage Beta Acids by weight
 * @apiBody {String} [form] One of "Pellet", "Plug", or "Leaf"
 * @apiBody {String} [notes]
 * @apiBody {String} [origin] Geographical origin of the hop
 * @apiBody {String} [supplier] Brand name of the supplier
 * @apiBody {Number} [humulene] Percentage by weight
 * @apiBody {Number} [caryolphyllene] Percentage by weight
 * @apiBody {Number} [cohumulone] Percentage by weight
 * @apiBody {Number} [myrcene] Percentage by weight
 * @apiUse successResponse
 * @apiSuccess {String} hopUuid
 */

const createHopValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate
    .body("name")
    .exists(opt)
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  customHopNameValidator,
  validate.body("hopUuid").optional(opt).isUUID(1),
  validate.body("createdBy").exists(opt).isString().custom(isExistingUid),
  validate.body("alpha").exists().custom(isPercentage),
  validate.body("beta").optional().custom(isPercentage),
  validate
    .body("form")
    .optional()
    .custom(isValidHopForm),
  validate
    .body("notes")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate
    .body("origin")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("supplier")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .customSanitizer(validate.xssSanitize),
  validate.body("humulene").optional().custom(isPercentage),
  validate.body("caryophyllene").optional().custom(isPercentage),
  validate.body("cohumulone").optional().custom(isPercentage),
  validate.body("myrcene").optional().custom(isPercentage),
  validate.catchValidationErrors,
];

const createHopController = async (req, res, next) => {
  try {
    const hopUuid = await hopService.createHop(
      req.params.breweryUuid,
      validate.cleanRequestBody(req, { removeUndefined: true })
    );
    return res.locals.sendResponse(res, { hopUuid });
  } catch (error) {
    console.log(error);
    return next(res.locals.opError("Hop creation failed", error));
  }
};

export const createHop = [
  createHopValidation,
  createHopController,
];


// updateHop
/**
 * @api {post} breweries/:breweryUuid/hops/:hopUuid Update hop
 * @apiName UpdateHop
 * @apiGroup Hops
 * @apiDescription Update a hop
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} hopUuid The brewery's unique identifier
 * @apiBody {String} [name] A name for the hop
 * @apiBody {String} [hopUuid] A unique identifier for the hop (a v1 UUID)
 * @apiBody {Number} [alpha] Percentage Alpha Acids by weight (a whole-number percentage)
 * @apiBody {Number} [beta] Percentage Beta Acids by weight
 * @apiBody {String} [form] One of "Pellet", "Plug", or "Leaf"
 * @apiBody {String} [notes]
 * @apiBody {String} [origin] Geographical origin of the hop
 * @apiBody {String} [supplier] Brand name of the supplier
 * @apiBody {Number} [humulene] Percentage by weight
 * @apiBody {Number} [caryolphyllene] Percentage by weight
 * @apiBody {Number} [cohumulone] Percentage by weight
 * @apiBody {Number} [myrcene] Percentage by weight
 * @apiUse successResponse
 */

const updateHopValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate
    .param("hopUuid")
    .exists(opt)
    .custom(isExistingHopUuid),
  validate
    .body("name")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .customSanitizer(validate.xssSanitize),
  customHopNameValidator,
  validate.body("alpha").optional().custom(isPercentage),
  validate.body("beta").optional().custom(isPercentage),
  validate
    .body("form")
    .optional()
    .custom(isValidHopForm),
  validate
    .body("notes")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate
    .body("origin")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .customSanitizer(validate.xssSanitize),
  validate
    .body("supplier")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .customSanitizer(validate.xssSanitize),
  validate.body("humulene").optional().custom(isPercentage),
  validate.body("caryophyllene").optional().custom(isPercentage),
  validate.body("cohumulone").optional().custom(isPercentage),
  validate.body("myrcene").optional().custom(isPercentage),
  validate.catchValidationErrors,
];

const updateHopController = async (req, res, next) => {
  try {
    const { breweryUuid, hopUuid } = req.params;
    await hopService.updateHop(
      breweryUuid,
      hopUuid,
      validate.cleanRequestBody(req, { removeUndefined: true })
    );
    return res.locals.sendResponse(res);
  } catch (error) {
    console.log(error)
    return next(res.locals.opError("Hop update failed", error));
  }
};

export const updateHop = [updateHopValidation, updateHopController];

// deleteHop
/**
 * @api {delete} /breweries/:breweryUuid/hops/:hopUuid Delete hop
 * @apiName DeleteHop
 * @apiGroup Hops
 * @apiDescription Delete a hop
 * @apiUse authHeader
 * @apiParam {String} breweryUuid The brewery's unique identifier
 * @apiParam {String} hopUuid The hop's unique identifier
 * @apiUse successResponse
 */
const deleteHopValidation = [
  validate
    .param("breweryUuid")
    .exists(opt)
    .custom(isExistingBreweryUuid),
  validate
    .param("hopUuid")
    .exists(opt)
    .custom(isExistingHopUuid),
  validate.catchValidationErrors,
];

const deleteHopController = async (req, res, next) => {
  try {
    await hopService.deleteHop(req.params.breweryUuid, req.params.hopUuid);
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(res.locals.opError("Hop deletion failed", error));
  }
};

export const deleteHop = [deleteHopValidation, deleteHopController];