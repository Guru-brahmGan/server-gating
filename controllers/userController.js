const {gpuMarketplaceContractInstance} = require('../Contract/contract.js')
const {gpuMarketplaceContract , provider} = gpuMarketplaceContractInstance()

const txIdUsed = require('../models/txIdUsed.js')
const Order = require('../models/order.js')

const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const isUser = async(req,res) => {

    const walletAddress = req.body.walletAddress;
    const userBool = await gpuMarketplaceContract.isRegistered(walletAddress);

    return res.json({
        userBool: userBool,
    })

}

const register = async(req,res) => {

    try {
        // Extract info from the request body
        const name = req.body.name;
        const orgName = req.body.organization;
        const referrerId = req.body.referrerId;
        const userAddress = req.body.userAddress;
    
        // Check if the everything is provided
        if (!name || !referrerId || !orgName || !userAddress) {
          return res
            .status(400)
            .json({ error: "Not all the required details are provided." });
        }

        const gasPrice = await provider.getFeeData()

        if (referrerId === 246800) {
          const realRef = 100001
          const registerClient = await gpuMarketplaceContract.registerUser(
            name,
            realRef,
            orgName,
            userAddress,
            {
              gasPrice: gasPrice.maxFeePerGas,
            }
          );
          const clientUserId = parseInt(registerClient);
          const txId = generateRandomString(7);
          console.log(txId);
          const addGPoints = await gpuMarketplaceContract.gPBuyWithStripe(
            txId,
            1000,
            clientUserId,
            {
              gasPrice: gasPrice.maxFeePerGas,
            }
          );
          const savedTx = new txIdUsed({
            txId
          })
          await savedTx.save();
        } else {
          const register = await gpuMarketplaceContract.registerUser(
            name,
            referrerId,
            orgName,
            userAddress,
            {
              gasPrice: gasPrice.maxFeePerGas,
            }
          );
          nonClientUserId = parseInt(register);
        }
        
        
        // await register.wait;
        // console.log(register)
        console.log('Data is validated')
        console.log("Tx Sent")
        
        res.json({ success: true, message: "Registered user successfully" });
      } catch (e) {
        console.error("Error registering user:", e);
        res.status(500).json({ success: false, message: 'Internal Server Error' });

      }

}

const orders = async(req,res) => {

    try {
        const walletAddress = req.body.walletAddress;
    
        if (!walletAddress) {
          return res.status(400).json({ error: "Wallet address is required." });
        }
        const maxOrderId = await gpuMarketplaceContract.orderId();
        const userOrders = [];

        for(let i=0; i<= maxOrderId; i++) {
          const order = await gpuMarketplaceContract.orders(i);
          if(order.renter.toLowerCase() === walletAddress.toLowerCase()) {
            const endTimeStamp = parseInt(order.orderTimestamp + (order.rentalDuration*60*60))
            
            userOrders.push({
              orderId: i,
              machineId: order.machineId.toString(),
              rentalDuration: endTimeStamp,
              renter: order.renter,
              isPending: order.isPending
            });
          }

        }

        // const userInfo = await gpuMarketplaceContract.users(walletAddress);
        // const UID = parseInt(userInfo[1])
    
        // const info = await Order.find({
        //   renterId: UID,
        // });
    
        // res.json({ success: true, message: info });
        res.json({
          success: true,
          orders: userOrders
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

}

const machinesOwned = async(req, res) => {
    
    try{
        
        const address = req.body.walletId;
        const gpuList = await gpuMarketplaceContract.machinesOwned(address);
        const parsedGpuList = gpuList.map(id => parseInt(id));
        res.json({
            bundles : parsedGpuList
        })
        
    }catch(e){
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

}

const info = async(req,res) => {

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
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }

}

const dashboardAnalytics = async(req,res) => {

  try{

    const walletAddress = req.body.walletAddress;
    const user = await gpuMarketplaceContract.users(walletAddress);
    const gpBalance = parseInt(user.gPointsBalance)
    const gpuList = await gpuMarketplaceContract.machinesOwned(walletAddress);
    const parsedGpuList = gpuList.map(id => parseInt(id));
    const listedCount = parsedGpuList.length;
    res.json({
      gPoints: gpBalance,
      listedCount: listedCount
    })

  }catch(e){
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }

}

const verifyTweet =  async(req, res) => {

    const userAddress = req.body.userAddress;
    const gasPrice = await provider.getFeeData()
    try {
      const tweeted = await gpuMarketplaceContract.verifyTweet(userAddress,{gasPrice: gasPrice.maxFeePerGas});
      res.json({ success: true, message: "Verified successfully" });
    } catch (e) {
      console.error("Error registering user:", e);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

}
  

module.exports = {
    isUser,
    register,
    orders,
    machinesOwned,
    info,
    dashboardAnalytics,
    verifyTweet
}