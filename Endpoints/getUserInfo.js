const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()
const Order = require('../Schemas/order.js')
const gPointsUpdate = require('../Schemas/gPointsUpdate.js')

const getUserInfo = async(req,res) => {

    try{

        const walletAddress = req.body.walletAddress;
    
        if (!walletAddress) {
          return res.status(400).json({ error: "Wallet address is required." });
        }
    
        const userInfo = await gpuMarketplaceContract.users(walletAddress);
        const UID = parseInt(userInfo[1])
        
        const machineOwned = await gpuMarketplaceContract.machinesOwned(walletAddress)
        const machineCalls = []
    
        for(const machine of machineOwned){
          machineCalls.push(gpuMarketplaceContract.machines(parseInt(machine)))
        }
    
        const responses = await Promise.all(machineCalls);
        let machineListed = 0
        
        for(const machineResponse of responses){
          if(machineResponse[10]){
              machineListed++
          }
        }

        const startTimestamp = ((Math.floor(Date.now() / 1000)) - (24*60*60*7))
        const allGpointsUpdate = []

        const gPointsInfo = await gPointsUpdate.find({
          "user":walletAddress,
          "timestamp": {$gte:startTimestamp}
        });

        for(const update of gPointsInfo){
          
          if(update.orderType!=1){
            allGpointsUpdate.push({
              "amount":update.amount,
              "timestamp":update.timestamp
            })
          }

          else{
            allGpointsUpdate.push({
              "amount":-update.amount,
              "timestamp":update.timestamp
            })
          }
        
        }


        // const info = await Order.find({"renterId":UID});
        // const orderCount = info.length
        // let totalHoursRented = 0
        // let totalGpointsPaid = 0
    
        // for(const order of info ){
        //   totalHoursRented += order.hoursRented
        //   totalGpointsPaid += order.gPointsPaid
        // }
    
        // const avgOrderValue = totalGpointsPaid/orderCount
        // const avgHoursRented = totalHoursRented/orderCount
    
        // const finalResponse = {
        //   "avgOrderValue":avgOrderValue,
        //   "avgHoursRented":avgHoursRented,
        //   "machineListed":machineListed
        // }

        const finalResponse = {
          "machineListed":machineListed,
          "gPointsUpdate":allGpointsUpdate
        }
    
        res.json({ success: true, message: finalResponse });
    
      }catch(e){
        console.log(e)
        res.json({ success: false, message: "Something went wrong." });
      }

}

module.exports = getUserInfo