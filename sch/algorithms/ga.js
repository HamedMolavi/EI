
class GeneticAlgorithmSolver extends PlacementAlgorithm {
  constructor() {
    super()

    this.jsonSetting = null

    this.curPopulation = []
    this.nextPopulation = []
    this.rouletteWheel = []
    this.funcHillChromosome = null
    this.arrSolutionHistory = []
    this.finalAnswer = false
  }

  ConfigureGeneticAlgorithmParameters(jsonNewSetting) {
    this.jsonSetting = {}

    jsonNewSetting['Algorithms'].forEach(alg => {
      if (alg['Name'] == 'Genetic-Algorithm') {
        this.jsonSetting['Params'] = clone(alg['Params'])
      }
    })

    this.ImportK8HostsAndJobs(jsonNewSetting)
  }

  CheckTerminationCriteria() {
    var flag1 = false, flag2 = false
    var x1

    if (this.jsonSetting['Params']['TerminationPolicies']['MaxTotalNumberOfIterations'] != null) {
      if (this.arrSolutionHistory.length > this.jsonSetting['Params']['TerminationPolicies']['MaxTotalNumberOfIterations']) {
        flag1 = true
      }
    }

    if (this.jsonSetting['Params']['TerminationPolicies']['MaxNumberOfUnchangedBestAnswer'] != null) {
      if (this.arrSolutionHistory.length > this.jsonSetting['Params']['TerminationPolicies']['MaxNumberOfUnchangedBestAnswer']) {
        x1 = this.arrSolutionHistory.slice(-this.jsonSetting['Params']['TerminationPolicies']['MaxNumberOfUnchangedBestAnswer'])
        x1 = x1.map(hh => hh['BestChromosome'].placementValue)

        if (x1[0] == x1[x1.length - 1]) {
          flag2 = true
        }

      }
    }

    return ((flag1 || flag2))
  }

  GenerateRandomPopulation() {
    var x1, x2, rndJob, rndHost
    var sampleChromosome, testChromosome

    for (x1 = 0; x1 < this.jsonSetting['Params']['PopulationSize']; x1++) {
      sampleChromosome = []
      for (x2 = 0; x2 < this.arrK8Jobs.length; x2++) {
        sampleChromosome.push(-1)
      }

      for (x2 = 0; x2 < sampleChromosome.length; x2++) {
        rndJob = Math.floor(Math.random() * this.arrK8Jobs.length)

        if (sampleChromosome[rndJob] == -1) {
          rndHost = Math.floor(Math.random() * this.arrK8Hosts.length)

          testChromosome = clone(sampleChromosome)
          testChromosome[rndJob] = rndHost

          if (this.CheckConstraints(testChromosome)[0]) {
            sampleChromosome = clone(testChromosome)
          }
        }
      }

      this.curPopulation.push(
        new PlacementSolution(
          sampleChromosome,
          this.CalculatePlacementValue(sampleChromosome)
        )
      )
    }
  }

  GenerateRouletteWheel() {
    var x1, x2, x3
    var minFitness, maxFitness

    x1 = this.curPopulation.map(chr => chr.placementValue)
    maxFitness = Math.max(...x1)
    minFitness = Math.min(...x1)

    if (maxFitness == minFitness) {
      minFitness = maxFitness - 10
    }

    this.rouletteWheel = []
    for (x1 = 0; x1 < this.curPopulation.length; x1++) {
      x2 = 10 - ((maxFitness - this.curPopulation[x1].placementValue) * (10 - 1) / (maxFitness - minFitness))
      x2 = Math.round(x2)
      for (x3 = 0; x3 < x2; x3++) {
        this.rouletteWheel.push(x1)
      }
    }
  }

  GetARandomChromosomeNumber() {
    var x1, ans

    x1 = Math.floor(Math.random() * this.rouletteWheel.length)
    ans = this.rouletteWheel[x1]

    return (ans)
  }

  LogBestSolution() {
    var solRecord = {
      'BestChromosome': {},
      'WorstChromosome': {},
      'AverageChromosome': {},
      'HostUtilisation': {}
    }
    var placementValues, x1, x2, x3
    var minFitness, maxFitness, avgFitness


    placementValues = this.curPopulation.map(chr => chr.placementValue)

    minFitness = Math.min(...placementValues)
    maxFitness = Math.max(...placementValues)

    x1 = placementValues.indexOf(maxFitness)
    solRecord['BestChromosome'] = clone(this.curPopulation[x1])


    x1 = placementValues.indexOf(minFitness)
    solRecord['WorstChromosome'] = clone(this.curPopulation[x1])

    avgFitness = 0
    placementValues.forEach(ft => avgFitness += ft)
    avgFitness = avgFitness / placementValues.length

    x2 = placementValues.map(vl => Math.abs(vl - avgFitness))
    x3 = Math.min(...x2)
    x3 = x2.indexOf(x3)
    solRecord['AverageChromosome'] = clone(this.curPopulation[x3])

    solRecord['HostUtilisation'] = this.CalculateHostUtilisation(solRecord['BestChromosome'].placementArray)

    this.arrSolutionHistory.push(solRecord)
  }

  SortPopulation() {
    this.curPopulation.sort((chrA, chrB) => {
      return (chrB.placementValue - chrA.placementValue)
    })
  }

  OperationElitism() {
    var x1

    for (x1 = 0; x1 < (this.jsonSetting['Params']['OptimizationParameters']['ElitismPercentage'] * this.curPopulation.length); x1++) {
      this.nextPopulation.push(this.curPopulation[x1])
    }
  }

  OperationCrossover(solChromosomes) {
    var x1, x2
    var ansChromosomes

    ansChromosomes = clone(solChromosomes)

    if (Math.random() < this.jsonSetting['Params']['OptimizationParameters']['CrossoverProbability']) {
      x1 = Math.floor(Math.random() * solChromosomes[0].placementArray.length)

      x2 = solChromosomes[0].placementArray.slice(0, x1)
      x2 = x2.concat(solChromosomes[1].placementArray.slice(x1))
      ansChromosomes[0].placementArray = clone(x2)

      x2 = solChromosomes[1].placementArray.slice(0, x1)
      x2 = x2.concat(solChromosomes[0].placementArray.slice(x1))
      ansChromosomes[1].placementArray = clone(x2)


      ansChromosomes[0].placementValue = super.CalculatePlacementValue(ansChromosomes[0].placementArray)
      ansChromosomes[1].placementValue = super.CalculatePlacementValue(ansChromosomes[1].placementArray)
    }

    return (ansChromosomes)
  }

  OperationMutation(solChromosomes) {
    var x1, rndHost
    var ansChromosomes

    ansChromosomes = clone(solChromosomes)

    for (x1 = 0; x1 < ansChromosomes[0].placementArray.length; x1++) {
      if (Math.random() < this.jsonSetting['Params']['OptimizationParameters']['MutationProbability']) {
        rndHost = Math.floor(Math.random() * this.arrK8Hosts.length)
        ansChromosomes[0].placementArray[x1] = rndHost
      }

      if (Math.random() < this.jsonSetting['Params']['OptimizationParameters']['MutationProbability']) {
        rndHost = Math.floor(Math.random() * this.arrK8Hosts.length)
        ansChromosomes[1].placementArray[x1] = rndHost
      }
    }

    ansChromosomes[0].placementValue = super.CalculatePlacementValue(ansChromosomes[0].placementArray)
    ansChromosomes[1].placementValue = super.CalculatePlacementValue(ansChromosomes[1].placementArray)

    return (ansChromosomes)
  }

  OperationHealChromosomeTrim(solChromosome) {
    var ansChromosome
    var rndJob

    ansChromosome = clone(solChromosome)

    while (this.CheckConstraints(ansChromosome.placementArray)[0] == false) {
      do {
        rndJob = Math.floor(Math.random() * this.arrK8Jobs.length)
      } while (ansChromosome.placementArray[rndJob] == -1)
      ansChromosome.placementArray[rndJob] = -1
    }

    ansChromosome.placementValue = super.CalculatePlacementValue(ansChromosome.placementArray)

    return (ansChromosome)
  }

  OperationHealChromosomeTrimFill(solChromosome) {
    // Trim means => random delete k8jobs from the solChromosme until it becomes an acceptable solution, in other words, passed the CheckConstraints()
    // Fill means => try for a limited number of times (eg, the length of the solChromosome) to randomly add k8jobs to k8hosts. Make sure that adding a job will not violate CheckConstraints()
    var ansChromosome

    ansChromosome = clone(solChromosome)
    ansChromosome = OperationHealChromosomeTrim(ansChromosome)
    for (let x2 = 0; x2 < ansChromosome.placementArray.length; x2++) {
      rndJob = Math.floor(Math.random() * this.arrK8Jobs.length)
      if (ansChromosome.placementArray[rndJob] == -1) {
        rndHost = Math.floor(Math.random() * this.arrK8Hosts.length)
        let testChromosome = clone(ansChromosome)
        testChromosom.placementArraye[rndJob] = rndHost
        if (this.CheckConstraints(testChromosome.placementArray)[0]) {
          ansChromosome = clone(testChromosome)
        }
      }
    }

    ansChromosome.placementValue = super.CalculatePlacementValue(ansChromosome.placementArray)
    return (ansChromosome)
  }

  OperationHealingChromosomeSmartTrimFill(solChromosome) {
    //Write the TrimFill healing procedure
    // SmartTrim means => instead of randomly deleting k8jobs from the solChromosme, only delete k8jobs from k8hosts that are violating the CheckConstraints()
    // Fill means => try for a limited number of times (eg, the length of the solChromosome) to randomly add k8jobs to k8hosts. Make sure that adding a job will not violate CheckConstraints()

    var ansChromosome

    ansChromosome = clone(solChromosome)
    let cnts = this.CheckConstraints(ansChromosome.placementArray)
    while (cnts[0] == false) {
      const violatedHost = cnts[1]['CpuFreeCapacity'].findIndex((cfc) => cfc < 0) ?? cnts[1]['MemFreeCapacity'].findIndex((mfc) => mfc < 0) ?? cnts[1]['NetFreeCapacity'].findIndex((nfc) => nfc < 0)
      let arr = ansChromosome.placementArray.map((hostNo, jobNo) => hostNo === violatedHost ? jobNo : undefined).filter((el) => !!el)
      let job = arr[Math.floor(Math.random() * arr.length)]
      console.log(clone(ansChromosome.placementArray))
      ansChromosome.placementArray[job] = -1
      console.log(ansChromosome.placementArray)
      console.log(arr, job)
      cnts = this.CheckConstraints(ansChromosome.placementArray)
    }
    for (let x2 = 0; x2 < ansChromosome.placementArray.length; x2++) {
      let rndJob = Math.floor(Math.random() * this.arrK8Jobs.length)
      if (ansChromosome.placementArray[rndJob] == -1) {
        let rndHost = Math.floor(Math.random() * this.arrK8Hosts.length)
        let testChromosome = clone(ansChromosome)
        testChromosome.placementArraye[rndJob] = rndHost
        console.log(testChromosome, ansChromosome)
        if (this.CheckConstraints(testChromosome.placementArray)[0]) {
          ansChromosome = clone(testChromosome)
        }
      }
    }
    return (ansChromosome)

  }

  Solve(numIterations) {
    var chrsA, chrsB, chrsC
    var cc = 0

    switch (this.jsonSetting['Params']['OptimizationParameters']['HealingMethod']) {
      case 'Trim':
        this.funcHillChromosome = this.OperationHealChromosomeTrim
        break;

      case 'Trim-Fill':
        this.funcHillChromosome = this.OperationHealChromosomeTrimFill
        break

      case 'SmartTrim-Fill':
        this.funcHillChromosome = this.OperationHealingChromosomeSmartTrimFill
        break

      default:
        this.funcHillChromosome = ((a) => { return (a) })
        break;
    }

    if (this.curPopulation.length == 0) {
      this.GenerateRandomPopulation()
      this.SortPopulation()
      this.LogBestSolution()
      cc = 1
    }

    do {
      cc++
      this.nextPopulation = []

      this.OperationElitism()
      this.GenerateRouletteWheel()

      while (this.nextPopulation.length < this.jsonSetting['Params']['PopulationSize'] * this.jsonSetting['Params']['OptimizationParameters']['OverProductionFactor']) {
        chrsA = []

        chrsA.push(this.curPopulation[this.GetARandomChromosomeNumber()])
        chrsA.push(this.curPopulation[this.GetARandomChromosomeNumber()])

        chrsB = this.OperationCrossover(chrsA)
        chrsC = this.OperationMutation(chrsB)

        chrsC[0] = this.funcHillChromosome(chrsC[0])
        chrsC[1] = this.funcHillChromosome(chrsC[1])

        if (this.CheckConstraints(chrsC[0].placementArray)[0]) {
          this.nextPopulation.push(chrsC[0])
        }
        if (this.CheckConstraints(chrsC[1].placementArray)[0]) {
          this.nextPopulation.push(chrsC[1])
        }
      }

      this.curPopulation = clone(this.nextPopulation)
      this.SortPopulation()
      this.curPopulation = this.curPopulation.slice(0, this.jsonSetting['Params']['PopulationSize'])
      this.LogBestSolution()
    } while (this.CheckTerminationCriteria() == false && cc < numIterations)

    if (this.CheckTerminationCriteria()) {
      this.finalAnswer = true
    } else {
      this.finalAnswer = false
    }

    return (this.finalAnswer)
  }
}
