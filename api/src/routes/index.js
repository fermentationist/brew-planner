/**
 * @apiDefine authHeader
 * @apiHeader Firebase-Token Retrieved from Firebase when client logs in. Identifies the user.
  */

/**
 * @apiDefine successResponse
 * @apiSuccess {String} status="ok" Request status, "ok" for successful requests
 */

/**
  * @api {all}
  * @apiUse authHeader
  */

import { Router } from "express";
import breweryRouter from "./breweries.js";
import adminRouter from "./admin.js";
// import publicRouter from "./public.js";
import { useAuth } from "../middleware/auth.js";
import testController from "../controllers/testController.js";
// import { getVariants } from "../controllers/variants.js";

const router = Router();

// router.use("/public", publicRouter);
router.use("/", useAuth);
router.get("/test", testController);
router.use("/breweries", breweryRouter);
router.use("/admin", adminRouter);
// router.get("/variants", getVariants);

export default router;
