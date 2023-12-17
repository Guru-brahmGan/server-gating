const express = require("express");
const infoController = require("../controllers/infoController.js")
const infoRouter = express.Router();

infoRouter.route("/getBlock").get(infoController.getBlock);
infoRouter.route("/healthCheck").get(infoController.healthCheck);
infoRouter.route("/topGpointHolders").get(infoController.topGpointHolders);
infoRouter.route("/getBundleInfo").get(infoController.getBundleInfo);
infoRouter.route("/getOrderId").get(infoController.getOrderId);

module.exports = infoRouter;