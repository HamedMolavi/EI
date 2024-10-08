class MostValuableFirstFitSolver extends PlacementAlgorithm {
  constructor() {
    super()
    this.placementSolution = null
    this.placementHostUtilisation = null
  }

  ConfigureMostValuableFirstFitParameters(jsonNewSetting) {
    this.ImportK8HostsAndJobs(jsonNewSetting)
  }

  Solve() {
    let sortedJobs, jobNo, hostNo
    let placementArray = []
    let x1

    for (x1 = 0; x1 < this.arrK8Jobs.length; x1++) {
      placementArray.push(-1)
    }

    sortedJobs = clone(this.arrK8Jobs)
    sortedJobs.sort((jobA, jobB) => {
      return (jobB.jobValue - jobA.jobValue)
    })
    for (x1 = 0; x1 < sortedJobs.length; x1++) {
      jobNo = this.arrK8Jobs.findIndex((job) => (job.jobID === sortedJobs[x1].jobID))
      for (hostNo = 0; hostNo < this.arrK8Hosts.length; hostNo++) {
        placementArray[jobNo] = hostNo
        if (this.CheckConstraints(placementArray)[0] == true) {
          break
        } else {
          placementArray[jobNo] = -1
        }
      }
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
