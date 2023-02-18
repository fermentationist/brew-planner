import * as brewhouseService from "../services/brewhouse.js";
import { rejectOnFalse } from "../utils/helpers.js";
import * as fermentableService from "../services/fermentable.js";
import * as validate from "../middleware/input-validation.js";
import { isExistingBreweryUuid } from "./breweries.js";
import { inputError } from "../server/errors.js";

//validation helpers

const opt = { checkFalsy: true };
const numOpt = { no_symbols: true };

/**
 * @apiDefine Fermentables
 * @apiGroup Routes to administer fermentables
 */
/**
 

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
 * @api {post} breweries/:breweryUuid/brewhouses Create fermentable
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
