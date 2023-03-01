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
import { useAuth } from "../middleware/auth.js";
import testController from "../controllers/testController.js";

const router = Router();

router.use("/", useAuth);
router.get("/test", testController);
router.use("/breweries", breweryRouter);
router.use("/admin", adminRouter);

export default router;
