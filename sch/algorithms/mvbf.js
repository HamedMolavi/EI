const clone = require("clone");
const { PlacementAlgorithm, PlacementSolution } = require(".");

class MostValuableBestFitSolver extends PlacementAlgorithm {
  constructor() {
    super();
  }

  ConfigureMostValuableBestFitParameters({ K8Hosts }) {
    this.ImportK8Hosts({ K8Hosts });
  }

  Solve(jobs) {
    let placementArray = Array(jobs.length).fill(-1);

    let sortedJobs = clone(jobs);
    sortedJobs.sort((jobA, jobB) => jobB.value - jobA.value);

    for (const sortedJob of sortedJobs) {
      let originalJobIndex = jobs.findIndex((job) => (job.id === sortedJob.id));

      let freeCapacityList = this.hosts.reduce((res, host, hostIndex) => {
        let localPlacementArray = clone(placementArray)
        localPlacementArray[originalJobIndex] = hostIndex
        const constraints = this.CheckConstraints(jobs, localPlacementArray)
        if (!!constraints[0]) {
          res.push({
            jobNo: originalJobIndex, hostIndex: hostIndex,
            'CpuFreeCapacity': constraints[1].CpuFreeCapacity[hostIndex],
            'MemFreeCapacity': constraints[1].MemFreeCapacity[hostIndex],
            'NetFreeCapacity': constraints[1].NetFreeCapacity[hostIndex]
          })
        }
        return res;
      }, [])
      freeCapacityList.sort((fcl1, fcl2) => (fcl2.CpuFreeCapacity + fcl2.MemFreeCapacity + fcl2.NetFreeCapacity) - (fcl1.CpuFreeCapacity + fcl1.MemFreeCapacity + fcl1.NetFreeCapacity))
      placementArray[originalJobIndex] = freeCapacityList.at(-1)?.hostIndex ?? -1
    }

    let placementSolution= new PlacementSolution(
      placementArray,
      this.Calculatevalue(jobs, placementArray)
    );
    return {
      placementSolution,
      'HostUtilisation': this.CalculateHostUtilisation(jobs, placementSolution.array)
    }
  }
}

module.exports = {
  MostValuableBestFitSolver
}