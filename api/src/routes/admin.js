import { Router } from "express";
import testController from "../controllers/testController.js";
import { protectAdminRoutes } from "../middleware/auth.js";
import {
  createUser,
  getUsers,
  patchUser,
  deleteUser
} from "../controllers/users.js";
import {
  createBrewery,
  // updateBrewery,
  // deleteBrewery
} from "../controllers/breweries.js";
// import {
//   createVariant,
//   updateVariant,
//   deleteVariant
// } from "../controllers/variants.js";

const router = Router();

// admin routes
router.use("/", protectAdminRoutes);
router.get("/test", testController);
router.get("/users", getUsers);
router.post("/users", createUser);
router.patch("/users/:uid", patchUser);
router.delete("/users/:uid", deleteUser);
router.post("/breweries", createBrewery);
// router.patch("/breweries/:breweryId", updateBrewery);
// router.delete("/breweries/:breweryId", deleteBrewery);
// router.post("/variants", createVariant);
// router.patch("/variants/:sku", updateVariant);
// router.delete("/variants/:sku", deleteVariant);
export default router;
