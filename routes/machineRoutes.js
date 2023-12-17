const express = require("express");
const machineController = require("../controllers/machineController.js")
const machineRouter = express.Router();

machineRouter.route('/available').get(machineController.available);

machineRouter.route('/listToggle').post(machineController.listToggle);
machineRouter.route('/rent').post(machineController.rent);
machineRouter.route('/register').post(machineController.register)
machineRouter.route('/addDummy').post(machineController.addDummy)
machineRouter.route('/details').post(machineController.details)
machineRouter.route('/initSsh').post(machineController.initSSH)
machineRouter.route('/setBidPrice').post(machineController.setBidPrice)


module.exports = machineRouter