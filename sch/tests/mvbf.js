const { MostValuableBestFitSolver } = require("../algorithms/mvbf");

const solverMVBF = new MostValuableBestFitSolver();
const K8Hosts = [
  {
    "id": "Host-1",
    "cpu": 4000,
    "mem": 4000,
    "net": 1000000
  }
];
const K8Jobs = [
  {
    "id": "Job-1",
    "value": 20,
    "cpu": 2592,
    "mem": 2242,
    "net": 55961
  }
]
solverMVBF.ConfigureMostValuableBestFitParameters({ K8Hosts, K8Jobs });

// delete all data
solverMVBF.placementSolution = undefined;

// solve
solverMVBF.Solve();

let timer = setInterval(() => {
  if (solverMVBF.placementSolution != undefined) {
    clearInterval(timer);
    console.log({
      'Algorithm': 'Most-Valuables-Best-Fit',
      'PlacementSolution': solverMVBF.placementSolution,
      'HostUtilisation': solverMVBF.placementHostUtilisation['HostUtilisation']
    })
  }
}, 5000);

