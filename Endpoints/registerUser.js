const {gpuMarketplaceContractInstance} = require('..//Contract/contract.js')
const {gpuMarketplaceContract} = gpuMarketplaceContractInstance()
const txIdUsed = require('../Schemas/txIdUsed.js')

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const registerUser = async(req,res) => {

    try {
        // Extract info from the request body
        const name = req.body.name;
        const orgName = req.body.organization;
        const referrerId = req.body.referrerId;
        const userAddress = req.body.userAddress;
    
        // Check if the everything is provided
        if (!name && !referrerId && !signature && !messageHash && !userAddress) {
          return res
            .status(400)
            .json({ error: "Not all the required details are provided." });
        }
        if (referrerId === 246800) {
          const realRef = 100001
          const registerClient = await gpuMarketplaceContract.registerUser(
            name,
            realRef,
            orgName,
            userAddress
          );
          const clientUserId = parseInt(registerClient);
          const txId = generateRandomString(7);
          console.log(txId);
          const addGPoints = await gpuMarketplaceContract.gPBuyWithStripe(
            txId,
            1000,
            clientUserId
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
            userAddress
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

module.exports = registerUser