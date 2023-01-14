import * as variantService from "../services/variant.js";
import * as validate from "../middleware/input-validation.js";
import { rejectOnFalse } from "../utils/helpers.js";

// validation helpers
const opt = { checkFalsy: true };
const numberChecker = input => {
  return typeof input === "number" && input >= 0;
}
const numberStringChecker = input => {
  return typeof input === "string" && numberChecker(Number(input));
}
const skuChecker = async input => {
  return variantService.isExistingVariantAttribute(input, "sku");
}
const fullnameChecker = async (input, sku) => {
  return ! await variantService.isExistingFullname(input, sku);
}
const isPositiveNumberString = rejectOnFalse(numberStringChecker);
const isPositiveNumber = rejectOnFalse(numberChecker);
const isExistingSKU = rejectOnFalse(skuChecker);
const isNotExistingFullname = rejectOnFalse(fullnameChecker);
const isNotExistingSKU = async input => {
  const isExisting = await skuChecker(input);
  if (isExisting) {
    return Promise.reject(false)
  }
  return Promise.resolve(true);
}
const customSKUValidator = async (req, res, next) => {
  const paramSKU = req.params.sku;
  const bodySKU = req.body.sku;
  if (bodySKU === paramSKU || !(await skuChecker(bodySKU))) {
    return next();
  }
  return next(res.locals.inputError([{msg: "Invalid value", location: "body", param: "sku"}]));
}

const customFullnameValidator = async (req, res, next) => {
  const sku = req.params.sku;
  const fullname = req.body.fullname;
  if (!fullname || await fullnameChecker(fullname, sku) ) {
    return next();
  }
  return next(res.locals.inputError([{msg: "Invalid value", location: "body", param: "fullname"}]));
}

/**
 * @api {get} /variants Get variants
 * @apiName GetVariants
 * @apiGroup Variants
 * @apiUse authHeader
 * @apiDescription Get all variants
 * @apiUse successResponse
 */

export const getVariants = async (req, res, next) => {
  try {
    const variants = await variantService.getVariants(req.params.breweryId);
    return res.locals.sendResponse(res, { variants });
  } catch (error) {
    return next(res.locals.opError("Request to get variants failed", error));
  }
};

/**
 * @api {post} /admin/variants Create variant
 * @apiName CreateVariant
 * @apiGroup Variants
 * @apiUse authHeader
 * @apiDescription Create a new product variant
 * @apiBody {String} sku A unique (internal) identifier for the new variant (Stock Keeping Unit)
 * @apiBody {String} fullname A unique display name for the variant
 * @apiBody {String} variantName A name to distinguish the variant from other variants of the same product, i.e. "750ml" or "large"
 * @apiBody {String} brandName
 * @apiBody {String} productName
 * @apiBody {String} [upc] The variant's UPC (Universal Product Code)
 * @apiBody {Number} [length] The physical length of the variant in inches
 * @apiBody {Number} [width] The physical width of the variant in inches
 * @apiBody {Number} [height] The physical height of the variant in inches
 * @apiBody {Number} [weight] The physical weight of the variant in pounds
 * @apiUse successResponse
 * @apiSuccess {String} sku The sku of the newly created variant
 *
 */
const createVariantValidation = [
  validate
    .body("sku")
    .exists(opt)
    .isString()
    .customSanitizer(validate.xssSanitize)
    .isLength({ min: 4, max: 25 })
    .custom(isNotExistingSKU),
  validate
    .body("fullname")
    .exists(opt)
    .isString()
    .customSanitizer(validate.xssSanitize)
    .isLength({ min: 4, max: 150 })
    .custom(isNotExistingFullname),
  validate
    .body("variantName")
    .exists(opt)
    .isString()
    .customSanitizer(validate.xssSanitize)
    .isLength({ max: 50 }),
  validate
    .body("brandName")
    .exists(opt)
    .isString()
    .customSanitizer(validate.xssSanitize)
    .isLength({ max: 110 }),
  validate
    .body("productName")
    .exists(opt)
    .isString()
    .customSanitizer(validate.xssSanitize)
    .isLength({ max: 110 }),
  validate
    .body("upc")
    .optional(opt)
    .isString()
    .isLength({ max: 13 })
    .custom(isPositiveNumberString),
  validate.body("length").optional(opt).custom(isPositiveNumber),
  validate.body("width").optional(opt).custom(isPositiveNumber),
  validate.body("height").optional(opt).custom(isPositiveNumber),
  validate.body("weight").optional(opt).custom(isPositiveNumber),
  validate.catchValidationErrors
];
const createVariantFunction = async (req, res, next) => {
  const cleanedInput = validate.cleanRequestBody(req);
  try {
    const sku = await variantService.createVariant(cleanedInput);
    return res.locals.sendResponse(res, { sku });
  } catch (error) {
    console.log(error);
    return next(res.locals.opError("Variant creation failed", error));
  }
};
export const createVariant = [createVariantValidation, createVariantFunction];

/**
 * @api {post} /admin/variants/:sku Update a variant
 * @apiName UpdateVariant
 * @apiGroup Variants
 * @apiUse authHeader
 * @apiDescription Update an existing product variant
 * @apiParam {String} sku The SKU of the variant to update
 * @apiBody {String} [fullname] A unique display name for the variant
 * @apiBody {String} [sku] An updated SKU, must be unique
 * @apiBody {String} [variantName] A name to distinguish the variant from other variants of the same product, i.e. "750ml" or "large"
 * @apiBody {String} [brandName]
 * @apiBody {String} [productName]
 * @apiBody {String} [upc] The variant's UPC (Universal Product Code)
 * @apiBody {Number} [length] The physical length of the variant in inches
 * @apiBody {Number} [width] The physical width of the variant in inches
 * @apiBody {Number} [height] The physical height of the variant in inches
 * @apiBody {Number} [weight] The physical weight of the variant in pounds
 * @apiUse successResponse
 *
 */
 const updateVariantValidation = [
  validate
    .param("sku")
    .exists(opt)
    .custom(isExistingSKU),
  validate
    .body("sku")
    .optional(opt)
    .isString()
    .customSanitizer(validate.xssSanitize)
    .isLength({ min: 4, max: 25 }),
  customSKUValidator,
  validate
    .body("fullname")
    .optional(opt)
    .isString()
    .customSanitizer(validate.xssSanitize)
    .isLength({ max: 150 }),
  customFullnameValidator,
  validate
    .body("variantName")
    .optional(opt)
    .isString()
    .customSanitizer(validate.xssSanitize)
    .isLength({ max: 50 }),
  validate
    .body("brandName")
    .optional(opt)
    .isString()
    .customSanitizer(validate.xssSanitize)
    .isLength({ max: 110 }),
  validate
    .body("productName")
    .optional(opt)
    .isString()
    .customSanitizer(validate.xssSanitize)
    .isLength({ max: 110 }),
  validate
    .body("upc")
    .optional(opt)
    .isString()
    .isLength({ max: 13 })
    .custom(isPositiveNumberString),
  validate.body("length").optional(opt).custom(isPositiveNumber),
  validate.body("width").optional(opt).custom(isPositiveNumber),
  validate.body("height").optional(opt).custom(isPositiveNumber),
  validate.body("weight").optional(opt).custom(isPositiveNumber),
  validate.catchValidationErrors
];
const updateVariantFunction = async (req, res, next) => {
  const cleanedInput = validate.cleanRequestBody(req, {removeUndefined: true});
  try {
    await variantService.updateVariant(req.params.sku, cleanedInput);
    return res.locals.sendResponse(res);
  } catch (error) {
    console.log(error);
    return next(res.locals.opError("Variant udpate failed", error));
  }
};
export const updateVariant = [updateVariantValidation, updateVariantFunction];

/**
 * @api {post} /admin/variants/:sku Delete a variant
 * @apiName DeleteVariant
 * @apiGroup Variants
 * @apiUse authHeader
 * @apiDescription Delete an existing product variant
 * @apiParam {String} sku The SKU of the variant to update
 * @apiUse successResponse
 *
 */
 const deleteVariantValidation = [
  validate
    .param("sku")
    .exists(opt)
    .custom(isExistingSKU),
  validate.catchValidationErrors
];
const deleteVariantFunction = async (req, res, next) => {
  try {
    await variantService.deleteVariant(req.params.sku);
    return res.locals.sendResponse(res);
  } catch (error) {
    let errorOutput = error;
    if (error.sqlState === "23000") {
      errorOutput = res.locals.opError("Cannot delete a variant while it is being referenced by inventory or a customer order", error); 
    } else {
      errorOutput = res.locals.opError("Variant deletion failed", error);
    }
    return next(errorOutput);
  }
};
export const deleteVariant = [deleteVariantValidation, deleteVariantFunction];
