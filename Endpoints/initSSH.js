const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js');
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance();
const axios = require("axios");

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

module.exports = initSSH