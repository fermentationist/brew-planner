import { opError } from "../server/errors.js";
import * as inventoryService from "../services/inventory.js";
import * as variantService from "../services/variant.js";
import * as validate from "../middleware/input-validation.js";
import { isExistingBreweryId } from "./breweries.js";
import { rejectOnFalse } from "../utils/helpers.js";

// validation helpers
const opt = { checkFalsy: true };
const skuChecker = input => {
  return variantService.isExistingVariantAttribute(input, "sku");
}
const inventoryIdChecker = input => {
  return inventoryService.isExistingInventoryAttribute(input, "inventoryId");
}
const isExistingSKU = rejectOnFalse(skuChecker);
const isValidInventoryId = rejectOnFalse(inventoryIdChecker);

// apiDocs definitions
/**
 * @apiDefine Inventory
 * @apiGroup routes to administer inventory
 */

/**
 * @apiDefine inventoryObject
 * @apiSuccess {Object} inventory.inventory
 * @apiSuccess {String} inventory.inventory.inventoryId
 * @apiSuccess {Number} inventory.inventory.available Stock available for purchase
 * @apiSuccess {Number} inventory.inventory.allocated Stock allocated to existing orders
 * @apiSuccess {Number} inventory.inventory.price
 * @apiSuccess {Number} inventory.inventory.addedAt
 */

/**
 * @apiDefine breweryObject
 * @apiSuccess {Object} inventory.brewery
 * @apiSuccess {String} inventory.brewery.breweryId
 * @apiSuccess {String} inventory.brewery.name
 * @apiSuccess {Object} inventory.brewery.address
 * @apiSuccess {String} inventory.brewery.address.street
 * @apiSuccess {String} inventory.brewery.address.unit
 * @apiSuccess {String} inventory.brewery.address.city
 * @apiSuccess {String} inventory.brewery.address.state
 * @apiSuccess {String} inventory.brewery.address.zip
 * @apiSuccess {String} inventory.brewery.address.country
 */
/**
 * @apiDefine variantObject
 * @apiSuccess {Object} inventory.variant
 * @apiSuccess {String} inventory.variant.variant_name The variant name, i.e. "large" or "750ml"
 * @apiSuccess {String} inventory.variant.fullname The display name for the variant
 * @apiSuccess {String} inventory.variant.brand_name
 * @apiSuccess {String} inventory.variant.product_name
 * @apiSuccess {String} inventory.variant.sku The SKU (Stock Keeping Unit) is our internal unique identifier for each variant
 * @apiSuccess {String} inventory.variant.upc A UPC (Universal Product Code), which should be unique to each variant
 * @apiSuccess {Number} inventory.variant.length Length in inches (product dimension)
 * @apiSuccess {Number} inventory.variant.width Width in inches (product dimension)
 * @apiSuccess {Number} inventory.variant.height Height in inches (product dimension)
 * @apiSuccess {Number} inventory.variant.weight Weight in pounds
 * @apiSuccess {Number} inventory.variant.addedAt
 */

/**
 * @apiDefine inventoryResponse
 * @apiSuccess {String} status="ok" Request status, "ok" for successful requests
 * @apiSuccess {Object[]} inventory An array of inventory objects
 * @apiUse inventoryObject
 * @apiUse breweryObject
 * @apiUse variantObject
 */

// getAllInventory
/**
 * @api {get} /breweries/inventory Get all inventory (admin)
 * @apiName GetInventory
 * @apiGroup Inventory
 * @apiUse authHeader
 * @apiDescription Get inventory for all breweries
 * @apiUse inventoryResponse
 */
export const getAllInventory = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getAllInventory();
    return res.locals.sendResponse(res, { inventory });
  } catch (error) {
    return next(
      opError("Request to get inventory for all breweries failed", error)
    );
  }
};

/**
 * @api {get} /breweries/:breweryId/inventory Get brewery inventory
 * @apiName GetBreweryInventory
 * @apiGroup Inventory
 * @apiUse authHeader
 * @apiDescription Get all inventory for a brewery
 * @apiParam {String} breweryId The ID of the current brewery
 * @apiUse inventoryResponse
 */
const getBreweryInventoryValidation = [
  validate.param("breweryId").exists(opt).custom(isExistingBreweryId),
  validate.catchValidationErrors
];
const getBreweryInventoryFunction = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getBreweryInventory(
      req.params.breweryId
    );
    return res.locals.sendResponse(res, { inventory });
  } catch (error) {
    return next(opError("Request to get brewery inventory failed", error));
  }
};
export const getBreweryInventory = [
  getBreweryInventoryValidation,
  getBreweryInventoryFunction
];

/**
 * @api {post} /breweries/:breweryId/inventory Create brewery inventory
 * @apiName CreateBreweryInventory
 * @apiGroup Inventory
 * @apiUse authHeader
 * @apiDescription Insert a product variant into inventory
 * @apiParam {String} breweryId The ID of the current brewery
 * @apiBody {String} sku The sku of the product variant to be inserted into inventory
 * @apiBody {Number} [quantity] Stock available for purchase
 * @apiBody {Number} [price]
 * @apiUse successResponse
 * @apiSuccess {String} inventoryId ID of the newly created inventory entry
 *
 */
const createBreweryInventoryValidation = [
  validate.param("breweryId").exists(opt).custom(isExistingBreweryId),
  validate.body("sku").exists(opt).custom(isExistingSKU),
  validate.body("price").optional(opt).isNumeric(),
  validate.body("quantity").optional(opt).isNumeric(),
  validate.catchValidationErrors
];
const createBreweryInventoryFunction = async (req, res, next) => {
  const cleanedInput = validate.cleanRequestBody(req);
  try {
    const inventoryId = await inventoryService.createBreweryInventory(
      req.params.breweryId,
      cleanedInput
    );
    return res.locals.sendResponse(res, { inventoryId });
  } catch (error) {
    return next(res.locals.opError("Insert into inventory failed", error));
  }
};
export const createBreweryInventory = [
  createBreweryInventoryValidation,
  createBreweryInventoryFunction
];

/**
 * @api {patch} /breweries/:breweryId/inventory/:inventoryId Update brewery inventory data (update price)
 * @apiName UpdateBreweryInventory
 * @apiGroup Inventory
 * @apiUse authHeader
 * @apiDescription Update variant, product, and brand data for an inventory entry
 * @apiParam {String} breweryId The ID of the current brewery
 * @apiParam {String} inventoryId The ID of the inventory entry to update
 * @apiBody {Number} price
 * @apiUse successResponse
 */

const updateBreweryInventoryValidation = [
  validate.param("breweryId").exists(opt).custom(isExistingBreweryId),
  validate.param("inventoryId").exists(opt).custom(isValidInventoryId),
  validate.body("price").exists(opt).isNumeric(),
  validate.catchValidationErrors
];
const updateBreweryInventoryFunction = async (req, res, next) => {
  try {
    const cleanedData = validate.cleanRequestBody(req);
    await inventoryService.updateBreweryInventory(
      req.params.breweryId,
      req.params.inventoryId,
      cleanedData
    );
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(
      opError("Error while attempting to update inventory properties", error)
    );
  }
};
export const updateBreweryInventory = [
  updateBreweryInventoryValidation,
  updateBreweryInventoryFunction
];

/**
 * @api {patch} /breweries/:breweryId/inventoryChange Create inventory change (modify stock quantities)
 * @apiName CreateInventoryChange
 * @apiGroup Inventory
 * @apiUse authHeader
 * @apiDescription Create an inventory change, modifying the available quantity of an existing variant in brewery inventory
 * @apiParam {String} breweryId The ID of the current brewery
 * @apiBody {Number} qtyDiff The difference by which to modify the brewery's available stock quantity
 * @apiBody {String} sku The variant's SKU
 * @apiBody {String} reason The reason for the inventory modification
 * @apiBody {String} [note] Notes about the inventory change
 * @apiUse successResponse
 */

const createInventoryChangeValidation = [
  validate.param("breweryId").exists(opt).custom(isExistingBreweryId),
  validate.body("qtyDiff").exists(opt).isInt(),
  validate.body("sku").exists(opt).custom(isExistingSKU),
  validate
    .body("reason")
    .exists(opt)
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate
    .body("note")
    .optional(opt)
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate.catchValidationErrors
];

const createInventoryChangeFunction = async (req, res, next) => {
  try {
    const cleanedData = validate.cleanRequestBody(req);
    await inventoryService.createInventoryChange(
      req.params.breweryId,
      cleanedData
    );
    return res.locals.sendResponse(res);
  } catch (error) {
    return next(opError("Error while creating inventory change", error));
  }
};
export const createInventoryChange = [
  createInventoryChangeValidation,
  createInventoryChangeFunction
];

/**
 * @api {get} /breweries/:breweryId/inventoryChange Get brewery inventory changes
 * @apiName GetInventoryChange
 * @apiGroup Inventory
 * @apiUse authHeader
 * @apiDescription Get all inventory changes for a brewery
 * @apiParam {String} breweryId The ID of the current brewery
 * @apiQuery {String} [sku] Return inventory changes for specific sku
 * @apiUse successResponse
 * @apiSuccess {Object[]} inventoryChanges
 * @apiSuccess {String} inventoryChanges.sku
 * @apiSuccess {Number} inventoryChanges.qtyDiff
 * @apiSuccess {Number} inventoryChanges.changedAt The time the change was created (unix timestamp)
 * @apiSuccess {String} inventoryChanges.reason The reason for the inventory change
 * @apiSuccess {String} inventoryChanges.note
 */
const getInventoryChangesValidation = [
  validate.param("breweryId").exists(opt).custom(isExistingBreweryId),
  validate.query("sku").optional(opt).custom(isExistingSKU),
  validate.catchValidationErrors
];
const getInventoryChangesFunction = async (req, res, next) => {
  try {
    const inventoryChanges = await inventoryService.getInventoryChanges(
      req.params.breweryId,
      req.query.sku
    );
    return res.locals.sendResponse(res, { inventoryChanges });
  } catch (error) {
    return next(opError("Request to get inventory changes failed", error));
  }
};
export const getInventoryChanges = [
  getInventoryChangesValidation,
  getInventoryChangesFunction
];
