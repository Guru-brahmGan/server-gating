const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()
const axios = require("axios");
const Order = require('../Schemas/order.js')

const rentMachine = async(req,res) => {

    try {
        // Extract required information from the request body
        const machineId = req.body.machineId;
        const rentalDuration = req.body.rentalDuration;
        const userId = req.body.userId;
    
        // Call the rentMachine function in smart contract and get the orderId
        const order = parseint(await gpuMarketplaceContract.rentMachine(
          machineId,
          rentalDuration,
          userId
        ));
        // const orderId = await gpuMarketplaceContract.orderId();
        // console.log(orderId);
        // Respond with the orderId
        // Calculate the timestamp when SSH access should be revoked
        const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
        const revokeTime = currentTime + rentalDuration * 3600; // Convert hours to seconds
    
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
          orderId: order,
          SSHInitiationResponse: initSSHResponse.data, // Include the response from SSH initiation
        });
    
        // Set a timeout to automatically call the revoke SSH access endpoint
        const timeoutInMilliseconds = rentalDuration * 3600 * 1000; // Convert hours to milliseconds
        setTimeout(async () => {
          try {
            // Call the revoke SSH access endpoint
            const revokeSSHResponse = await axios.post(
              "http://3.220.122.237:8080/revoke_ssh",
              {}
            );
            // orderId: order, // Pass the orderId to identify the machine
            console.log("SSH access revoked:", revokeSSHResponse.data);
          } catch (error) {
            console.error("Error revoking SSH access:", error.message);
          }
        }, timeoutInMilliseconds);
      } catch (error) {
        console.error("Error renting a machine:", error);
        res
          .status(500)
          .json({
            success: false,
            message: "Failed to rent the machine",
            error: error.message,
          });
      }

}

module.exports = rentMachine