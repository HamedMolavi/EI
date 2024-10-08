class MostValuableWorstFitSolver extends PlacementAlgorithm {
  constructor() {
    super()
    this.placementSolution = null
    this.placementHostUtilisation = null
  }

  ConfigureMostValuableWorstFitParameters(jsonNewSetting) {
    this.ImportK8HostsAndJobs(jsonNewSetting)
  }

  Solve() {
    let placementArray = []
    let x1

    for (x1 = 0; x1 < this.arrK8Jobs.length; x1++) {
      placementArray.push(-1)
    }

    let sortedJobs = clone(this.arrK8Jobs)
    sortedJobs.sort((jobA, jobB) => {
      return (jobB.jobValue - jobA.jobValue)
    })
    for (const [x1, sortedJob] of sortedJobs.entries()) {
      let jobNo = this.arrK8Jobs.findIndex((job) => (job.jobID === sortedJob.jobID))
      let freeCapacityList = this.arrK8Hosts.reduce((res, host, hostNo) => {
        let localPlacementArray = clone(placementArray)
        localPlacementArray[jobNo] = hostNo
        const constraints = this.CheckConstraints(localPlacementArray)
        if (!!constraints[0]) {
          res.push({
            jobNo, hostNo,
            'CpuFreeCapacity': constraints[1].CpuFreeCapacity[hostNo],
            'MemFreeCapacity': constraints[1].MemFreeCapacity[hostNo],
            'NetFreeCapacity': constraints[1].NetFreeCapacity[hostNo]
          })
        }
        return res;
      }, [])
      freeCapacityList.sort((fcl1, fcl2) => (fcl2.CpuFreeCapacity + fcl2.MemFreeCapacity + fcl2.NetFreeCapacity) - (fcl1.CpuFreeCapacity + fcl1.MemFreeCapacity + fcl1.NetFreeCapacity))
      //console.log(jobNo,freeCapacityList.at(0)?.hostNo ?? -1, sortedJob.toJSON(), freeCapacityList)
      placementArray[jobNo] = freeCapacityList.at(0)?.hostNo ?? -1
    }
    this.placementSolution = new PlacementSolution(
      placementArray,
      this.CalculatePlacementValue(placementArray)
    )

    this.placementHostUtilisation = {
      'HostUtilisation': this.CalculateHostUtilisation(this.placementSolution.placementArray)
    }
  }

}