import * as validate from "../middleware/input-validation.js";
import * as orderService from "../services/order.js";
import { isExistingBreweryId } from "./breweries.js";
import { rejectOnFalse } from "../utils/helpers.js";

// apiDocs definitions
/**
 * @apiDefine Orders
 * @apiGroup routes to administer customer orders
 */

/**
 * @apiDefine salesChannelObject
 * @apiSuccess {Object} orders.salesChannel
 * @apiSuccess {String} orders.salesChannel.salesChannelId A unique ID identifying the sales channel
 * @apiSuccess {String} orders.salesChannel.name The name of the sales channel
 */

/**
 * @apiDefine orderObject
 * @apiSuccess {String} orders.orderId A unique ID to identify the order
 * @apiSuccess {String} orders.email
 * @apiSuccess {Number} orders.subtotal
 * @apiSuccess {Number} orders.tax
 * @apiSuccess {Number} orders.shippingFee
 * @apiSuccess {Number} orders.total
 * @apiSuccess {Boolean} orders.isRefunded
 * @apiSuccess {Number} orders.placedAt The time the order was placed (unix timestamp)
 * @apiSuccess {String} orders.billingStreet
 * @apiSuccess {String} orders.billingUnit
 * @apiSuccess {String} orders.billingCity
 * @apiSuccess {String} orders.billingState
 * @apiSuccess {String} orders.billingZip
 * @apiSuccess {String} orders.billingCountry
 * @apiUse salesChannelObject
 */

/**
 * @apiDefine ordersResponse
 * @apiSuccess {String} status="ok" Request status, "ok" for successful requests
 * @apiSuccess {Object[]} orders An array of order objects
 * @apiUse orderObject
 */
// validation helpers


/**
 * @api {get} /breweries/orders Get orders
 * @apiName GetOrders
 * @apiGroup Orders
 * @apiUse authHeader
 * @apiDescription Get all orders
 * @apiUse ordersResponse
 */

export const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrders();
    return res.locals.sendResponse(res, { orders });
  } catch (error) {
    return next(res.locals.opError("Request to get orders failed", error));
  }
};
