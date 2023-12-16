const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()
const DummyMachines = require('../Schemas/dummyMachines.js')

const availableMachines = async(req,res) => {

    try {
        const maxMachineId = parseInt(await gpuMarketplaceContract.machineId());
        let allMachines = [];

        let machinesIgnoredList = []

        const machinesIgnored = await DummyMachines.find({});
  
        for(const machine of machinesIgnored){
          machinesIgnoredList.push(machine.machineId)
        }
  
        console.log(machinesIgnored);
        if (maxMachineId > 10000) {
          const allContractCall = [];
          let currentMachineId = 10001;
    
          while (maxMachineId >= currentMachineId) {
            allContractCall.push(gpuMarketplaceContract.machines(currentMachineId));
            currentMachineId++;
          }
    
          var responses = await Promise.all(allContractCall);
    
          for (let i = 0; i < responses.length; i++) {

            if(!(machinesIgnoredList.includes(10000 + i + 1))){

              const machineInfo = responses[i];
              const info = {
                machineId: 10000 + i + 1,
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

          }
    
          res.json({
            success: true,
            message: allMachines,
          });
        }
      } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }

}

module.exports = availableMachines