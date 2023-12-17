const axios = require("axios");
const {gpuMarketplaceContractInstance} = require('../contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()
const {provider} = gpuMarketplaceContractInstance()

const DummyMachines = require('../models/dummyMachines.js')
const Order = require('../models/order.js')
const orderTimeoutUpdate = require("../models/orderTimeout.js")
const RegisterMachine = require("../models/registerMachine.js");

const available = async(req,res) => {

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

const details = async(req,res) => {

    const machineId = req.body.machineId;
    const machineDetails = await gpuMarketplaceContract.machines(machineId);
    console.log(machineDetails);
    res.json({
      cpuName: machineDetails.cpuName,
    });

}

const listToggle = async(req,res) => {

    try {

        const machineId = req.body.machineId;
        const gasPrice = await provider.getFeeData()
        const setToggle = await gpuMarketplaceContract.listMachineToggle(machineId,{gasPrice: gasPrice.maxFeePerGas});
        
        res.json({
            message: "Successful",
            txHash: setToggle.hash
        })

    } catch(e){
        console.log(e);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
    
}

const rent = async(req,res) => {

    try {
        // Extract required information from the request body
        const machineId = req.body.machineId;
        const rentalDuration = req.body.rentalDuration;
        const userId = req.body.userId;
    
        // Call the rentMachine function in smart contract and get the orderId
        const order = await gpuMarketplaceContract.rentMachine(
          machineId,
          rentalDuration,
          userId
        );

        const currentTime = Math.floor(Date.now() / 1000);
        const revokeTime = currentTime + rentalDuration * 3600; 
        const orderId = parseInt(order);
        await orderTimeoutUpdate.create({ orderId, revokeTime });

        // const orderId = await gpuMarketplaceContract.orderId();
        // console.log(orderId);
        // Respond with the orderId
        // Calculate the timestamp when SSH access should be revoked
        // const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
        // const revokeTime = currentTime + rentalDuration * 3600; // Convert hours to seconds
        // Initiate SSH access by calling the external endpoint
        // const initSSHResponse = await axios.post(
        //   "http://3.220.122.237:8080/init_ssh",
        //   {}
        // );
        // orderId: order, // Pass the orderId to identify the machine
        // revokeTime: revokeTime, // Pass the revoke time to set the timeout

        // Respond with the orderId and the response from the SSH initialization endpoint
        res.json({
          success: true,
          message: "Machine rented successfully",
          orderId: orderId
        });
    
        // Set a timeout to automatically call the revoke SSH access endpoint
        // const timeoutInMilliseconds = rentalDuration * 3600 * 1000; // Convert hours to milliseconds
        // setTimeout(async () => {
        //   try {
        //     // Call the revoke SSH access endpoint
        //     const revokeSSHResponse = await axios.post(
        //       "http://3.220.122.237:8080/revoke_ssh",
        //       {}
        //     );
        //     // orderId: order, // Pass the orderId to identify the machine
        //     console.log("SSH access revoked:", revokeSSHResponse.data);
        //   } catch (error) {
        //     console.error("Error revoking SSH access:", error.message);
        //   }
        // }, timeoutInMilliseconds);
      } catch (error) {
        console.error("Error renting a machine:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }

}

const register = async(req,res) => {

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

const addDummy = async(req,res) => {

    try {

      const allMachines = req.body.machineIds;
      let machinesIgnoredList = []
      let info = []

      const machinesIgnored = await DummyMachines.find({
        machineId: { $in: allMachines }
      });

      for(const machine of machinesIgnored){
          machinesIgnoredList.push(machine.machineId)
      }

      for(const machineId of allMachines){

        if(!(machinesIgnoredList.includes(machineId))){
          info.push({
            "machineId":machineId
          })
        }

      }

      const newDummyMachine = info.map(info => new DummyMachines(info));

      DummyMachines.insertMany(newDummyMachine)
      .then(() => {
        console.log("New Dummy Machines Added!");
      })
      .catch((error) => {
        console.error("Error adding new Machines", error);
      });

      res.json({
        success: true,
      });

    }catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

}

const initSSH = async(req,res) => {

    const orderId = req.body.orderId;
    const maxOrderId = parseInt(await gpuMarketplaceContract.orderId());
    const orderInfo = await gpuMarketplaceContract.orders(orderId);
    const machineId = parseInt(orderInfo.machineId);
    const machineDetails = await gpuMarketplaceContract.machines(machineId);
    const ipAddress = machineDetails.IPAddress;
    const linkToSsh = "http://" + ipAddress + ":8080/init_ssh";
   
    const dataToSend = {
      "aws_access_key_id": process.env.aws_access_key_id,
      "aws_secret_access_key": process.env.aws_secret_access_key,
      "aws_region": process.env.aws_region,
      "ecr_repo": process.env.ecr_repo,
      "order_id": orderId,
      "order_duration": parseInt(orderInfo.orderTimestamp + (orderInfo.rentalDuration*60*60))
    }

    // const initSSHResponse = await axios.post(
    //   linkToSsh,
    //   dataToSend
    // );

    res.status(200).json({
      "machineId": machineId,
      "ipAddress" : ipAddress,
      "sshLink": linkToSsh,
      "maxOrderId": maxOrderId,
      "dataTo": dataToSend,
      // "sshlink": initSSHResponse.data
    })

}

const setBidPrice = async (req, res) => {

    try {

      const machineId = req.body.machineId;
      const newBidPrie = req.body.bidAmount;
      const setBid = await gpuMarketplaceContract.setBidPrice(machineId, newBidPrie);
      
      res.json({
        message: "Bid Price is set successfully",
        txHash: setBid.hash
      })

    }catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

module.exports = {
    available,
    listToggle,
    rent,
    register,
    addDummy,
    details,
    initSSH,
    setBidPrice
}

