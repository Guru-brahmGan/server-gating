const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()

const availableMachines = async(req,res) => {

    try {
        const maxMachineId = parseInt(await gpuMarketplaceContract.machineId());
        let allMachines = [];
    
        if (maxMachineId > 10000) {
          const allContractCall = [];
          let currentMachineId = 10001;
    
          while (maxMachineId >= currentMachineId) {
            allContractCall.push(gpuMarketplaceContract.machines(currentMachineId));
            currentMachineId++;
          }
    
          var responses = await Promise.all(allContractCall);
    
          for (const machineInfo of responses) {
            const info = {
              cpuName: machineInfo.cpuName,
              gpuName: machineInfo.gpuName,
              gpuVRAM: parseInt(machineInfo.gpuVRAM),
              totalRAM: parseInt(machineInfo.totalRAM),
              storageAvailable: parseInt(machineInfo.storageAvailable),
              coreCount: parseInt(machineInfo.coreCount),
              IPAddress: machineInfo.IPAddress,
              portsOpen: machineInfo.portsOpen,
              region: machineInfo.region,
              bidPrice: parseInt(machineInfo.bidPrice),
              isAvailable: machineInfo.isAvailable,
              isListed: machineInfo.isListed,
            };
    
            allMachines.push(info);
          }
    
          res.json({
            success: true,
            message: allMachines,
          });
        }
      } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Something went wrong." });
      }

}

module.exports = availableMachines