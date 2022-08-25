import { Router } from "express";
import testController from "../controllers/testController.js";
import { getBreweries } from "../controllers/breweries.js";
import { protectBreweryRoutes, protectAdminRoutes } from "../middleware/auth.js";
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
  deleteBreweryUser
} from "../controllers/users.js";

const router = Router();

// breweries routes
router.get("/", getBreweries);
// router.get("/inventory", [protectAdminRoutes, getAllInventory]);
router.use("/:breweryId/", protectBreweryRoutes);
router.get("/:breweryId/test", testController);
router.get("/:breweryId/users", getBreweryUsers);
router.post("/:breweryId/users", createBreweryUser);
router.delete("/:breweryId/users/:uid", deleteBreweryUser);
// router.get("/:breweryId/inventory", getBreweryInventory);
// router.post("/:breweryId/inventory", createBreweryInventory);
// router.patch("/:breweryId/inventory/:inventoryId", updateBreweryInventory);
// router.get("/:breweryId/inventoryChange", getInventoryChanges);
// router.post("/:breweryId/inventoryChange", createInventoryChange);
export default router;
