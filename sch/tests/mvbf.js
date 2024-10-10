const { MostValuableBestFitSolver } = require("../algorithms/mvbf");
const { K8Host } = require("../cluster/host");
const { K8Job } = require("../cluster/job");

const solverMVBF = new MostValuableBestFitSolver();
const K8Hosts = [
  new K8Host({
    "id": "Host-1",
    "cpu": 4000,
    "mem": 4000,
    "net": 1000000
  })
];
const K8Jobs = [
  new K8Job({
    "id": "Job-1",
    "value": 20,
    "cpu": 2592,
    "mem": 2242,
    "net": 55961
  })
]
solverMVBF.ConfigureMostValuableBestFitParameters({ K8Hosts });

// delete all data
solverMVBF.placementSolution = undefined;

// solve
const answer = solverMVBF.Solve(K8Jobs);
console.log(answer)
// console.log({
//   'Algorithm': 'Most-Valuables-Best-Fit',
//   'PlacementSolution': solverMVBF.placementSolution,
//   'HostUtilisation': solverMVBF.placementHostUtilisation['HostUtilisation']
// })

