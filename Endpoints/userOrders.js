const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()
const Order = require('../Schemas/order.js')

const userOrders = async(req,res) => {

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

module.exports = userOrders