const DummyMachines = require('../Schemas/dummyMachines.js')

const dummyMachinesUpdate = async(req,res) => {

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
        res.json({ success: false, message: e.message });
      }

}

module.exports = dummyMachinesUpdate