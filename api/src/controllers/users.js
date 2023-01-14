import * as userService from "../services/user.js";
import * as validate from "../middleware/input-validation.js";
import { rejectOnFalse } from "../utils/helpers.js";
import { breweryUuidChecker, isExistingBreweryUuid } from "./breweries.js";

//validation helpers
const uidChecker = input => userService.isExistingUserAttribute(input, "uid");
export const isExistingUid = rejectOnFalse(uidChecker);
const breweryUuidArrayChecker = async input => {
  for (const uuid of input) {
    const check = await breweryUuidChecker(uuid);
    if (!check) {
      return false;
    }
  }
  return true;
}
const isBreweryUuidArray = rejectOnFalse(breweryUuidArrayChecker);
const isAdminRole = input => userService.ALL_USER_ROLES.includes(input);
const isManagerRole = input =>
  userService.MANAGER_ADMINISTERED_USER_ROLES.includes(input);
const opt = { checkFalsy: true };

/**
 * @apiDefine Users
 * @apiGroup Routes to administer users
 */
/**
 * @api {get} /admin/users Get users (admin)
 * @apiName GetUsers
 * @apiGroup Users
 * @apiUse authHeader
 * @apiDescription Get all users
 * @apiUse successResponse
 * @apiSuccess {Object[]} users An array containing all users
 */

export const getUsers = async (req, res, next) => {
  try {
    const allUsers = await userService.getAllUsers();
    return res.locals.sendResponse(res, { users: allUsers });
  } catch (error) {
    return next(
      res,
      res.locals.opError(
        error.message
          ? error.message
          : typeof error === "string"
          ? error
          : "Error getting users"
      )
    );
  }
};


const getBreweryUsersValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.catchValidationErrors
];
const getBreweryUsersFunction = async (req, res, next) => {
  try {
    const allUsers = await userService.getBreweryUsers(req.params.breweryUuid);
    return res.locals.sendResponse(res, { users: allUsers });
  } catch (error) {
    return next(
      res,
      res.locals.opError(
        error.message
          ? error.message
          : typeof error === "string"
          ? error
          : "Error getting users"
      )
    );
  }
};
export const getBreweryUsers = [getBreweryUsersValidation, getBreweryUsersFunction];

/**
 *
 * @api {post} /admin/users Create user (admin)
 * @apiName CreateUser
 * @apiGroup Users
 * @apiDescription Create a new admin, manager or user. You must be logged in as an admin to use this route.
 * @apiUse authHeader
 * @apiBody {String} email The user's email
 * @apiBody {String} displayName The user's name
 * @apiBody {String{minimum length: 6 characters}} [password=random string] Optional password (must be at least six characters); if not given, a random password will be generated
 * @apiBody {String} role The user's authorization level, one of "admin", "manager", or "user"
 * @apiBody {Number[]} breweries Breweries the user is authorized to access - an array of brewery IDs
 * @apiUse successResponse
 * @apiSuccess {String} uid The user ID of the newly created user
 * @apiSuccess {String} resetLink A password reset link for the newly created user
 *
 */

const createUserValidation = [
  validate.body("email").exists(opt).isEmail().normalizeEmail(),
  validate.body("password").optional(opt).isString().isLength({ min: 6 }),
  validate.body("role").exists(opt).isString().custom(isAdminRole),
  validate.body("breweries").exists(opt).isArray().custom(isBreweryUuidArray),
  validate
    .body("displayName")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate.catchValidationErrors
];
const createUserFunction = async (req, res, next) => {
  try {
    const { uid } = await userService.createUser(
      validate.cleanRequestBody(req)
    );
    const resetLink = await userService.generatePasswordResetLink(
      req.body.email
    );
    return res.locals.sendResponse(res, { uid, resetLink });
  } catch (error) {
    if (error?.errorInfo?.code === "auth/email-already-exists") {
      return next(
        res.locals.opError("User creation failed", { name: "duplicate_user" })
      );
    }
    return next(res.locals.opError("User creation failed"));
  }
};
export const createUser = [createUserValidation, createUserFunction];

/**
 * @api {patch} /admin/users/:uid Update user (admin)
 * @apiName UpdateUser
 * @apiGroup Users
 * @apiDescription Update a user's role or breweries
 * @apiUse authHeader
 * @apiParam {String} uid The user's ID
 * @apiBody {String} [role] The user's authorization level, one of "admin", "manager", or "user"
 * @apiBody {Number[]} [breweries] An array containing the brewery IDs of the breweries the user is authorized to access
 * @apiUse successResponse
 */

const patchUserValidation = [
  validate.param("uid").exists(opt).isString().custom(isExistingUid),
  validate.body("role").optional(opt).isString().custom(isAdminRole),
  validate.body("breweries").optional(opt).isArray().custom(isBreweryUuidArray),
  validate.catchValidationErrors
];
const patchUserFunction = async (req, res, next) => {
  const uid = req.params.uid;
  const { role, breweries } = req.body;
  if (!role && !breweries) {
    return next(
      res.locals.inputError(
        'request body must include parameters "role" and/or "breweries"'
      )
    );
  }
  let newClaims = {};
  if (role) {
    newClaims.role = role;
  }
  if (breweries) {
    newClaims.breweries = breweries;
  }
  try {
    await userService.updateUser(uid, newClaims);
    return res.locals.sendResponse(res);
  } catch (error) {
    if (error?.errorInfo?.code === "auth/user-not-found") {
      return next(
        res.locals.opError("User update failed", { name: "user_not_found" })
      );
    }
    return next(res.locals.opError("User update failed"));
  }
};
export const patchUser = [patchUserValidation, patchUserFunction];


const createBreweryUserValidation = [
  validate.param("breweryUuid").exists(opt).custom(isExistingBreweryUuid),
  validate.body("email").exists(opt).isEmail(),
  validate.body("password").optional(opt).isString().isLength({ min: 6 }),
  validate.body("role").exists(opt).isString().custom(isManagerRole),
  validate
    .body("displayName")
    .optional()
    .isString()
    .customSanitizer(validate.xssSanitize),
  validate.catchValidationErrors
];
const createBreweryUserFunction = async (req, res, next) => {
  const data = {
    ...validate.cleanRequestBody(req),
    breweries: [req.params.breweryUuid]
  };
  try {
    const { uid } = await userService.createUser(data);
    const resetLink = await userService.generatePasswordResetLink(
      req.body.email
    );
    return res.locals.sendResponse(res, { uid, resetLink });
  } catch (error) {
    if (error?.errorInfo?.code === "auth/email-already-exists") {
      return next(
        res.locals.opError("User creation failed", { name: "duplicate_user" })
      );
    }
    return next(res.locals.opError("User creation failed"));
  }
};
export const createBreweryUser = [
  createBreweryUserValidation,
  createBreweryUserFunction
];

/**
 * @api {delete} /admin/users/:uid Delete user (admin)
 * @apiName DeleteUser
 * @apiGroup Users
 * @apiDescription Delete a user
 * @apiUse authHeader
 * @apiParam {String} uid The user's ID
 * @apiUse successResponse
 */
const deleteUserValidation = [
  validate.param("uid").exists(opt).isString().custom(isExistingUid),
  validate.catchValidationErrors
];
const deleteUserFunction = async (req, res, next) => {
  const uid = req.params.uid;
  try {
    await userService.deleteUser(uid);
    return res.locals.sendResponse(res);
  } catch (error) {
    if (error?.errorInfo?.code === "auth/invalid-uid") {
      return next(
        res.locals.opError("User deletion failed", { name: "invalid_uid" })
      );
    }
    return next(res.locals.opError("User deletion failed"));
  }
};
export const deleteUser = [deleteUserValidation, deleteUserFunction];


const deleteBreweryUserValidation = [
  validate
    .param("breweryUuid")
    .exists(opt)
    .isString({ min: 2 })
    .customSanitizer(validate.xssSanitize),
  validate.param("uid").exists(opt).isString(),
  validate.catchValidationErrors
];
const deleteBreweryUserFunction = async (req, res, next) => {
  const uid = req.params.uid;
  try {
    const user = await userService.getUser({ uid });
    if (user?.customClaims?.breweries?.includes(req.params.breweryUuid)) {
      await userService.deleteUser(uid);
      return res.locals.sendResponse(res);
    } else {
      return next(
        res.locals.opError(
          "User deletion failed. Client is not authorized to delete this user.",
          { name: "unauthorized" }
        )
      );
    }
  } catch (error) {
    if (error?.errorInfo?.code === "auth/invalid-uid") {
      return next(
        res.locals.opError("User deletion failed", { name: "invalid_uid" })
      );
    }
    return next(res.locals.opError("User deletion failed"));
  }
};
export const deleteBreweryUser = [
  deleteBreweryUserValidation,
  deleteBreweryUserFunction
];
