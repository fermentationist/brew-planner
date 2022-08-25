//routes that don't require authorization
import {Router} from "express";
import * as shopifyControllers from "../controllers/shopify.js";

const router = Router();

router.get("/shopify/:breweryId/fetch_stock.json", shopifyControllers.fetchStock);
router.post("/shopify/orders", shopifyControllers.orders);

export default router;
