import { Router } from "express";
import testController from "../controllers/testController.js";
import { getBreweries } from "../controllers/breweries.js";
import {
  protectBreweryRoutes,
  protectAdminRoutes,
} from "../middleware/auth.js";
import {
  getBreweryUsers,
  createBreweryUser,
  deleteBreweryUser,
} from "../controllers/users.js";
import {
  getBrewhouses,
  createBrewhouse,
  updateBrewhouse,
  deleteBrewhouse,
} from "../controllers/brewhouses.js";
import {
  createFermentable,
  getFermentables,
  updateFermentable,
  deleteFermentable,
} from "../controllers/fermentables.js";

import {
  createHop,
  getHops,
  updateHop,
  deleteHop,
} from "../controllers/hops.js";

import {
  createWater,
  getWaters,
  updateWater,
  deleteWater,
} from "../controllers/waters.js";

import {
  createYeast,
  getYeasts,
  updateYeast,
  deleteYeast,
} from "../controllers/yeasts.js";

import {
  createMisc,
  getMiscs,
  updateMisc,
  deleteMisc,
} from "../controllers/miscs.js";

const router = Router();

// breweries routes
router.get("/", getBreweries);
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
router.patch("/:breweryUuid/fermentables/:fermentableUuid", updateFermentable);
router.delete("/:breweryUuid/fermentables/:fermentableUuid", deleteFermentable);
router.get("/:breweryUuid/hops", getHops);
router.post("/:breweryUuid/hops", createHop);
router.patch("/:breweryUuid/hops/:hopUuid", updateHop);
router.delete("/:breweryUuid/hops/:hopUuid", deleteHop);
router.get("/:breweryUuid/waters", getWaters);
router.post("/:breweryUuid/waters", createWater);
router.patch("/:breweryUuid/waters/:waterUuid", updateWater);
router.delete("/:breweryUuid/waters/:waterUuid", deleteWater);
router.get("/:breweryUuid/yeasts", getYeasts);
router.post("/:breweryUuid/yeasts", createYeast);
router.patch("/:breweryUuid/yeasts/:yeastUuid", updateYeast);
router.delete("/:breweryUuid/yeasts/:yeastUuid", deleteYeast);
router.get("/:breweryUuid/miscs", getMiscs);
router.post("/:breweryUuid/miscs", createMisc);
router.patch("/:breweryUuid/miscs/:miscUuid", updateMisc);
router.delete("/:breweryUuid/miscs/:miscUuid", deleteMisc);
export default router;
