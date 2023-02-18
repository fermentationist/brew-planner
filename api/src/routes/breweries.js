import { Router } from "express";
import testController from "../controllers/testController.js";
import { getBreweries } from "../controllers/breweries.js";
import {
  protectBreweryRoutes,
  protectAdminRoutes,
} from "../middleware/auth.js";
// import {
//   getAllInventory,
//   getBreweryInventory,
//   createBreweryInventory,
//   updateBreweryInventory,
//   createInventoryChange,
//   getInventoryChanges
// } from "../controllers/inventory.js";
import {
  getBreweryUsers,
  createBreweryUser,
  deleteBreweryUser,
} from "../controllers/users.js";
import {
  getBrewhouses,
  createBrewhouse,
  updateBrewhouse,
  deleteBrewhouse
} from "../controllers/brewhouses.js";
import { createFermentable, getFermentables } from "../controllers/fermentables.js";

const router = Router();

// breweries routes
router.get("/", getBreweries);
// router.get("/inventory", [protectAdminRoutes, getAllInventory]);
router.use("/:breweryUuid/", protectBreweryRoutes);
router.get("/:breweryUuid/test", testController);
router.get("/:breweryUuid/users", getBreweryUsers);
router.post("/:breweryUuid/users", createBreweryUser);
router.delete("/:breweryUuid/users/:uid", deleteBreweryUser);
router.get("/:breweryUuid/brewhouses", getBrewhouses);
router.post("/:breweryUuid/brewhouses", createBrewhouse);
router.patch("/:breweryUuid/brewhouses/:brewhouseUuid", updateBrewhouse);
router.delete("/:breweryUuid/brewhouses/:brewhouseUuid", deleteBrewhouse);
router.get("/:breweryUuid/fermentables", getFermentables);
router.post("/:breweryUuid/fermentables", createFermentable);
// router.post("/:breweryUuid/brewhouses", createBrewhouse);
// router.get("/:breweryUuid/inventory", getBreweryInventory);
// router.post("/:breweryUuid/inventory", createBreweryInventory);
// router.patch("/:breweryUuid/inventory/:inventoryId", updateBreweryInventory);
// router.get("/:breweryUuid/inventoryChange", getInventoryChanges);
// router.post("/:breweryUuid/inventoryChange", createInventoryChange);
export default router;
