const {gpuMarketplaceContractWSInstance} = require('../contract/contract.js')
const {gpuMarketplaceContractWS} = gpuMarketplaceContractWSInstance()

const MachineRented = require('../models/machineRented.js');
const MachineListed = require('../models/machineListed.js');
const gPointsUpdate = require('../models/gPointsUpdate.js');

require('dotenv').config()
 
const eventLogs = () => {

    gpuMarketplaceContractWS.on("MachineListed", (_machineId, _name) => {
        const info = {
          machineId: _machineId,
          name: _name,
        };
      
        const newMachineListed = new MachineListed(info);
      
        newMachineListed
          .save()
          .then(() => {
            console.log("New MachineListed Event Added!");
          })
          .catch((error) => {
            console.error("Error adding data to MachineListed Event", error);
          });
      });
      
      gpuMarketplaceContractWS.on("MachineRented",(_orderId, _machineId, _renter) => {
          const info = {
            orderId: _orderId,
            machineId: _machineId,
            renter: _renter,
          };
      
          const newMachineRented = new MachineRented(info);
      
          newMachineRented
            .save()
            .then(() => {
              console.log("New MachineRented Event Added!");
            })
            .catch((error) => {
              console.error("Error adding data to MachineRented Event", error);
            });
        }
      );
      
      gpuMarketplaceContractWS.on("gPointsUpdate", (_user, _amount, _orderType) => {
        const info = {
          user: _user,
          amount: _amount,
          orderType: _orderType,
          timestamp: Math.floor(Date.now() / 1000)
        };
      
        const newgPointsUpdate = new gPointsUpdate(info);
      
        newgPointsUpdate
          .save()
          .then(() => {
            console.log("New gPointsUpdate Event Added!");
          })
          .catch((error) => {
            console.error("Error adding data to gPointsUpdate Event", error);
          });
      });
      

}

module.exports = eventLogs