const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()
const RegisterMachine = require("../Schemas/registerMachine");

const registerMachine = async(req,res) => {

    const machineData = req.body;
    const walletAddress = req.body.walletAddress;
  
    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required." });
    }
  
    try {
      const isUserRegistered = await gpuMarketplaceContract.isRegistered(
        walletAddress
      );
  
      if (!isUserRegistered) {
        return res
          .status(400)
          .json({ error: "Wallet address is not a registered user." });
      }
  
      const tx = parseInt(await gpuMarketplaceContract.registerMachines(
        machineData.cpuname,
        machineData.gpuname,
        machineData.spuVRam,
        machineData.totalRam,
        machineData.memorySize,
        machineData.coreCount,
        machineData.ipAddr,
        machineData.openedPorts,
        machineData.region,
        machineData.bidprice,
        machineData.walletAddress
      ));
  
      const receipt = await tx.wait();
  
      console.log(receipt.transactionHash);
  
      const info = {
        cpuname: machineData.cpuname,
        gpuname: machineData.gpuname,
        spuVRam: machineData.spuVRam,
        totalRam: machineData.totalRam,
        memorySize: machineData.memorySize,
        coreCount: machineData.coreCount,
        ipAddr: machineData.ipAddr,
        openedPorts: machineData.openedPorts,
        region: machineData.region,
        bidprice: machineData.bidprice,
        walletAddress: machineData.walletAddress,
      };
  
      const newRegisterMachine = new RegisterMachine(info);
  
      newRegisterMachine
        .save()
        .then(() => {
          console.log("New Machine Added!");
        })
        .catch((error) => {
          console.error("Error adding new Machine", error);
        });
  
      res.json({
        success: true,
        transactionHash: receipt.transactionHash,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

}

module.exports = registerMachine