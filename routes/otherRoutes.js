const express = require("express");
const otherController = require("../controllers/otherController.js")
const otherRouter = express.Router();

otherRouter.route('/generateSignature').get(otherController.generateSignature);

otherRouter.route('/gPBuyWithStripe').post(otherController.gPBuyWithStripe);
otherRouter.route('/customGpuRequest').post(otherController.customGpuRequest);
otherRouter.route('/getOrderSSH').post(otherController.getOrderSSH);

module.exports = otherRouter