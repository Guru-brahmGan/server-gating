const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()

const getMachineDetails = async(req,res) => {

    const machineId = req.body.machineId;
    const machineDetails = await gpuMarketplaceContract.machines(machineId);
    console.log(machineDetails);
    res.json({
      cpuName: machineDetails.cpuName,
    });

}

module.exports = getMachineDetails