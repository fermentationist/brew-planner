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
  updateBrewery,
  deleteBrewery
} from "../controllers/breweries.js";

const router = Router();

// admin routes
router.use("/", protectAdminRoutes);
router.get("/test", testController);
router.get("/users", getUsers);
router.post("/users", createUser);
router.patch("/users/:uid", patchUser);
router.delete("/users/:uid", deleteUser);
router.post("/breweries", createBrewery);
router.patch("/breweries/:breweryUuid", updateBrewery);
router.delete("/breweries/:breweryUuid", deleteBrewery);
export default router;
