const express = require("express");
const userController = require("../controllers/userController.js")
const userRouter = express.Router();


userRouter.route('/isUser').post(userController.isUser);
userRouter.route('/register').post(userController.register);
userRouter.route('/orders').post(userController.orders);
userRouter.route('/machinesOwned').post(userController.machinesOwned);
userRouter.route('/info').post(userController.info);
userRouter.route('/dashboardAnalytics').post(userController.dashboardAnalytics);
userRouter.route('/verifyTweet').post(userController.verifyTweet);

module.exports = userRouter