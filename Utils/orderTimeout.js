const {gpuMarketplaceContractInstance} = require('../Contract/contract.js')
const orderTimeoutUpdate = require("../models/orderTimeout.js")
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()

const orderTimeoutFunction = async() => {

        try{

            const currentTime = Math.floor(Date.now() / 1000); 
            const expiredOrders = await orderTimeoutUpdate.find({ revokeTime: { $lte: currentTime } });

            for(const order of expiredOrders){

                await gpuMarketplaceContract.completeOrder(order.orderId)
                await orderTimeoutUpdate.deleteOne({ orderId: order.orderId, revokeTime: order.revokeTime });
                console.log(`Complete order executed for order ${order.orderId}`);

            }

            const orderId = parseInt(await gpuMarketplaceContract.orderId());

            for (const expiredOrder of expiredOrders) {
                const revokeSSHResponse = await axios.post("http://3.220.122.237:8080/revoke_ssh", {});
            }

        }catch (error) {
            console.error("Error checking expired orders:", error.message);
        }

}

module.exports = orderTimeoutFunction