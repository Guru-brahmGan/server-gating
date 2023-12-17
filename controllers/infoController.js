const {gpuMarketplaceContractInstance} = require('../contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()
const {provider} = gpuMarketplaceContractInstance()

const getBlock = async(req,res) => {

    const currentBlock = await provider.getBlockNumber();
    res.json({
      currentBlock: currentBlock,
    });

}

const healthCheck = async(req,res) =>{
    
    res.status(200).json({
        message: "Server is working fine."
    });

}

const topGpointHolders = async(req,res) => {

    try {
        const userCount = await gpuMarketplaceContract.userIdCount();
        const totalUsers = userCount - 100;
    
        let loopCount = 0;
        let userId = 101;
    
        let registeredWallets = [];
        let walletGpoints = [];
        let userContractCall = [];
    
        while (loopCount < totalUsers) {
          userContractCall.push(gpuMarketplaceContract.UIDtoAddress(userId));
          userId++;
          loopCount++;
        }
    
        let responses = await Promise.all(userContractCall);
        for (const response of responses) {
          registeredWallets.push(response);
        }
    
        let gPointContractCall = [];
        for (const wallet of registeredWallets) {
          gPointContractCall.push(gpuMarketplaceContract.getUserGPoints(wallet));
        }
    
        responses = await Promise.all(gPointContractCall);
    
        for (const i in responses) {
          walletGpoints.push({
            wallet: registeredWallets[i],
            gPoint: parseInt(responses[i]),
          });
        }
    
        walletGpoints.sort(function (first, second) {
          return second.gPoint - first.gPoint;
        });
    
        res.json({
          success: true,
          message: walletGpoints.slice(0, 10),
        });
      } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }

}

const getBundleInfo = async(req, res) => {

    try{

      const firstBundle = parseInt(await gpuMarketplaceContract.bundleInfo(10));
      const secondBundle = parseInt(await gpuMarketplaceContract.bundleInfo(95));
      const thirdBundle = parseInt(await gpuMarketplaceContract.bundleInfo(900));
      const fourthBundle = parseInt(await gpuMarketplaceContract.bundleInfo(85000));
      res.json({
        bundles: [
          { usdAmount: 10, gPoints: firstBundle },
          { usdAmount: 95, gPoints: secondBundle },
          { usdAmount: 900, gPoints: thirdBundle },
          { usdAmount: 85000, gPoints: fourthBundle }
        ]
      })

    }catch(e){
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

}

const getOrderId = async (req, res) => {

  try{

    const maxOrderId = parseInt(await gpuMarketplaceContract.orderId());
    res.json({
      orderId: maxOrderId
    })

  }catch(e){
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }

}

module.exports = {
    getBlock,
    healthCheck,
    topGpointHolders,
    getBundleInfo,
    getOrderId,
}