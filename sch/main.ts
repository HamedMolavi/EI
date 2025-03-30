import { } from "./types/index";
import { Config } from "./config";
import express from 'express';
import ip from 'ip';
import { router as jobRouter } from "./routes/job";
import { envConfigs } from "./config/env";
envConfigs();

const app = express();
app.use(express.json({ inflate: true, limit: '100kb', strict: true, type: 'application/json', verify: undefined }));
process.conf = new Config({ app, });
const ipAddress = ip.address();
const ipPort = 3000;


if (process.env["SCH_MODE"]?.toLowerCase() === "offline") {
  console.log("Running offline scheduler loop!")
  setInterval(() => {
    if (!!process.conf) {
      const l = process.conf.jobs.length;
      for (let i = 0; i < l; i++) {
        const job = process.conf.jobs.shift();
        process.conf.hosts[process.conf.hostIndex]?.execute(job);
        process.conf.hostIndex = (process.conf.hostIndex + 1) % process.conf.hosts.length;
      }
    }
  }, parseInt(process.env["TIME_SLOT"] ?? "1000"));
}

app.use("/job", jobRouter);


app.listen(ipPort, () => {
  console.log(`Listening to ${ipAddress}:${ipPort} !!!`);
  // console.log(process.conf)
})



/*
const path = require('path');
const { MostValuableBestFitSolver } = require('./algorithms/mvbf');



const solverMVBF = new MostValuableBestFitSolver();
// const solverGA = new eiPlacementAlgorithms.GeneticAlgorithmSolver();
// const solverMVFF = new eiPlacementAlgorithms.MostValuableFirstFitSolver();
// const solverMVWF = new eiPlacementAlgorithms.MostValuableWorstFitSolver();

let solverGATimerObj = undefined;

app.use(express.json({
  inflate: true,
  limit: '100kb',
  reviver: undefined,
  strict: true,
  type: 'application/json',
  verify: undefined
}))

app.use(express.static(path.join(__dirname, "static")))
app.set("view engine", "ejs")
app.engine('ejs', require('ejs').__express);
app.set("views", path.join(__dirname, "static"))

///////////////////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
  res.send(`
    <h1>Placement Solver</h1>
    <p>Try the following links to see the performance for each algorithm</p>
    <ul>
    <li>Genetic Algorithm (GA): <a href="http://${req.headers.host}/ga" target="_blank" rel="noopener">http://${req.headers.host}/ga</a></li>
    <li>First-Fit (FF): <a href="http://${req.headers.host}/ff" target="_blank" rel="noopener">http://${req.headers.host}/ff</a></li>
    <li>Best-Fit (BF): <a href="http://${req.headers.host}/bf" target="_blank" rel="noopener">http://${req.headers.host}/bf</a></li>
    <li>Worst-Fit (WF): <a href="http://${req.headers.host}/wf" target="_blank" rel="noopener">http://${req.headers.host}/wf</a></li>
    </ul>
    `)
})

///////////////////////////////////////////////////////////////////////////////
// app.get('/ga', (req, res) => {
//   var x1, x2, x3, x4, x5, x6, x7, x8, x9, xx, hostUtil

//   if (solverGA.arrSolutionHistory.length == 0) {

//     x1 = 'N/A'
//     x2 = []
//     x3 = []
//     x4 = []
//     x5 = []
//     x6 = []
//     x7 = []
//     x8 = []

//   } else {

//     x2 = solverGA.arrK8Hosts.map(hh => hh.hostID)

//     x3 = []
//     x4 = []
//     x5 = []
//     hostUtil = solverGA.arrSolutionHistory[solverGA.arrSolutionHistory.length - 1]['HostUtilisation']
//     for (xx = 0; xx < solverGA.arrK8Hosts.length; xx++) {
//       x3.push(Math.round(hostUtil[solverGA.arrK8Hosts[xx].hostID]['CpuTotalUsage'] / hostUtil[solverGA.arrK8Hosts[xx].hostID]['CpuTotalCapacity'] * 100))
//       x4.push(Math.round(hostUtil[solverGA.arrK8Hosts[xx].hostID]['MemTotalUsage'] / hostUtil[solverGA.arrK8Hosts[xx].hostID]['MemTotalCapacity'] * 100))
//       x5.push(Math.round(hostUtil[solverGA.arrK8Hosts[xx].hostID]['NetTotalUsage'] / hostUtil[solverGA.arrK8Hosts[xx].hostID]['NetTotalCapacity'] * 100))
//     }

//     x6 = []
//     for (xx = 1; xx <= solverGA.arrSolutionHistory.length; xx++) {
//       x6.push(xx)
//     }

//     x7 = solverGA.arrSolutionHistory.map(sol => sol['BestChromosome'].placementValue)
//     x8 = solverGA.arrSolutionHistory.map(sol => sol['WorstChromosome'].placementValue)
//     x9 = solverGA.arrSolutionHistory.map(sol => sol['AverageChromosome'].placementValue)

//     x1 = x7[x7.length - 1]
//     if (solverGA.finalAnswer == true) {
//       x1 = x1.toString() + " (final)"
//     }
//   }

//   res.render(path.join(__dirname, "webpage-placement-ga.ejs"), {
//     htmlNodeID: 'K8 Pod Placement Solver: Genetic Algorithm (GA)',
//     htmlNodeIP: ipAddress.toString() + ":" + ipPort.toString(),

//     htmlBestSolutionValue: x1,

//     htmlHostNames: x2,
//     htmlHostCpuUtilisation: x3,
//     htmlHostMemUtilisation: x4,
//     htmlHostNetUtilisation: x5,

//     htmlGenerationNumbers: x6,
//     htmlGABestSolution: x7,
//     htmlGAWorstSolution: x8,
//     htmlGAAverageSolution: x9
//   })
// })

///////////////////////////////////////////////////////////////////////////////
// app.get('/ff', (req, res) => {
//   var x1, x2, x3, x4, x5, xx, hostUtil

//   if (solverMVFF.placementSolution == undefined) {

//     x1 = 'N/A'
//     x2 = []
//     x3 = []
//     x4 = []
//     x5 = []

//   } else {

//     x1 = solverMVFF.placementSolution.placementValue
//     x2 = solverMVFF.arrK8Hosts.map(hh => hh.hostID)

//     x3 = []
//     x4 = []
//     x5 = []
//     hostUtil = solverMVFF.placementHostUtilisation['HostUtilisation']
//     for (xx = 0; xx < solverMVFF.arrK8Hosts.length; xx++) {
//       x3.push(Math.round(hostUtil[solverMVFF.arrK8Hosts[xx].hostID]['CpuTotalUsage'] / hostUtil[solverMVFF.arrK8Hosts[xx].hostID]['CpuTotalCapacity'] * 100))
//       x4.push(Math.round(hostUtil[solverMVFF.arrK8Hosts[xx].hostID]['MemTotalUsage'] / hostUtil[solverMVFF.arrK8Hosts[xx].hostID]['MemTotalCapacity'] * 100))
//       x5.push(Math.round(hostUtil[solverMVFF.arrK8Hosts[xx].hostID]['NetTotalUsage'] / hostUtil[solverMVFF.arrK8Hosts[xx].hostID]['NetTotalCapacity'] * 100))
//     }
//   }

//   res.render(path.join(__dirname, "webpage-placement.ejs"), {
//     htmlNodeID: 'K8 Pod Placement Solver: Most Valuables First Fit (MVFF)',
//     htmlNodeIP: ipAddress.toString() + ":" + ipPort.toString(),

//     htmlBestSolutionValue: x1,

//     htmlHostNames: x2,
//     htmlHostCpuUtilisation: x3,
//     htmlHostMemUtilisation: x4,
//     htmlHostNetUtilisation: x5,
//   })
// })

///////////////////////////////////////////////////////////////////////////////
app.get('/bf', (req, res) => {
  var x1, x2, x3, x4, x5, xx, hostUtil

  if (solverMVBF.placementSolution == undefined) {

    x1 = 'N/A'
    x2 = []
    x3 = []
    x4 = []
    x5 = []

  } else {

    x1 = solverMVBF.placementSolution.placementValue
    x2 = solverMVBF.arrK8Hosts.map(hh => hh.hostID)

    x3 = []
    x4 = []
    x5 = []
    hostUtil = solverMVBF.placementHostUtilisation['HostUtilisation']
    for (xx = 0; xx < solverMVBF.arrK8Hosts.length; xx++) {
      x3.push(Math.round(hostUtil[solverMVBF.arrK8Hosts[xx].hostID]['CpuTotalUsage'] / hostUtil[solverMVBF.arrK8Hosts[xx].hostID]['CpuTotalCapacity'] * 100))
      x4.push(Math.round(hostUtil[solverMVBF.arrK8Hosts[xx].hostID]['MemTotalUsage'] / hostUtil[solverMVBF.arrK8Hosts[xx].hostID]['MemTotalCapacity'] * 100))
      x5.push(Math.round(hostUtil[solverMVBF.arrK8Hosts[xx].hostID]['NetTotalUsage'] / hostUtil[solverMVBF.arrK8Hosts[xx].hostID]['NetTotalCapacity'] * 100))
    }
  }

  res.render(path.join(__dirname, "webpage-placement.ejs"), {
    htmlNodeID: 'K8 Pod Placement Solver: Most Valuables Best Fit (MVBF)',
    htmlNodeIP: ipAddress.toString() + ":" + ipPort.toString(),

    htmlBestSolutionValue: x1,

    htmlHostNames: x2,
    htmlHostCpuUtilisation: x3,
    htmlHostMemUtilisation: x4,
    htmlHostNetUtilisation: x5,
  })
})

///////////////////////////////////////////////////////////////////////////////
// app.get('/wf', (req, res) => {
//   var x1, x2, x3, x4, x5, xx, hostUtil

//   if (solverMVWF.placementSolution == undefined) {

//     x1 = 'N/A'
//     x2 = []
//     x3 = []
//     x4 = []
//     x5 = []

//   } else {

//     x1 = solverMVWF.placementSolution.placementValue
//     x2 = solverMVWF.arrK8Hosts.map(hh => hh.hostID)

//     x3 = []
//     x4 = []
//     x5 = []
//     hostUtil = solverMVWF.placementHostUtilisation['HostUtilisation']
//     for (xx = 0; xx < solverMVWF.arrK8Hosts.length; xx++) {
//       x3.push(Math.round(hostUtil[solverMVWF.arrK8Hosts[xx].hostID]['CpuTotalUsage'] / hostUtil[solverMVWF.arrK8Hosts[xx].hostID]['CpuTotalCapacity'] * 100))
//       x4.push(Math.round(hostUtil[solverMVWF.arrK8Hosts[xx].hostID]['MemTotalUsage'] / hostUtil[solverMVWF.arrK8Hosts[xx].hostID]['MemTotalCapacity'] * 100))
//       x5.push(Math.round(hostUtil[solverMVWF.arrK8Hosts[xx].hostID]['NetTotalUsage'] / hostUtil[solverMVWF.arrK8Hosts[xx].hostID]['NetTotalCapacity'] * 100))
//     }
//   }

//   res.render(path.join(__dirname, "webpage-placement.ejs"), {
//     htmlNodeID: 'K8 Pod Placement Solver: Most Valuables Best Fit (MVBF)',
//     htmlNodeIP: ipAddress.toString() + ":" + ipPort.toString(),

//     htmlBestSolutionValue: x1,

//     htmlHostNames: x2,
//     htmlHostCpuUtilisation: x3,
//     htmlHostMemUtilisation: x4,
//     htmlHostNetUtilisation: x5,
//   })
// })

///////////////////////////////////////////////////////////////////////////////
app.post('/json', (req, res) => {
  let ans = "";
  var t1, t2
  var x1

  switch (req.body.MessageType) {
    case 'Setting':
      ans = "Config/Update: "

      req.body['Algorithms'].forEach(alg => {
        switch (alg['Name']) {
          case 'Most-Valuables-Best-Fit':
            const { K8Hosts, K8Jobs } = req.body;
            solverMVBF.ConfigureMostValuableBestFitParameters({ K8Hosts, K8Jobs });
            ans += '<MVBF>'
            break

          case 'Most-Valuables-First-Fit':
            solverMVFF.ConfigureMostValuableFirstFitParameters(req.body)
            ans += '<MVFF>'
            break

          case 'Most-Valuables-Worst-Fit':
            solverMVWF.ConfigureMostValuableWorstFitParameters(req.body)
            ans += '<MVWF>'
            break

          case 'Genetic-Algorithm':
            solverGA.ConfigureGeneticAlgorithmParameters(req.body)
            ans += '<GA>'
            break

        }
      });
      break;

    case 'Command':
      ans = `Execute:${req.body.SolverCommand}`
      switch (req.body.SolverCommand) {
        case 'Start':
          switch (req.body.SolverName) {
            case 'Most-Valuables-First-Fit':
              solverMVFF.Solve()
              ans += '<MVFF>'
              break

            case 'Most-Valuables-Best-Fit':
              solverMVBF.Solve()
              ans += '<MVBF>'
              break

            case 'Most-Valuables-Worst-Fit':
              solverMVWF.Solve()
              ans += '<MVWF>'
              break

            case 'Genetic-Algorithm':
              clearInterval(solverGATimerObj)

              t1 = Date.now()
              solverGA.Solve(50)
              t2 = Date.now()

              solverGATimerObj = setInterval(() => {
                if (solverGA.Solve(50) == true) {
                  clearInterval(solverGATimerObj)
                }
              }, (t2 - t1) * 1.5)

              ans += '<GA>'
              break
          }

          break

        case 'Stop':
          clearInterval(solverGATimerObj)
          break

        case 'DeleteAllData':
          solverGA.curPopulation = []
          solverGA.arrSolutionHistory = []

          solverMVFF.placementSolution = undefined
          solverMVBF.placementSolution = undefined
          solverMVWF.placementSolution = undefined
          break

        case 'Fetch-Solution':
          ans = {
            'Algorithm': 'N/A',
            'PlacementSolution': 'N/A',
            'HostUtilisation': 'N/A'
          }
          switch (req.body.SolverName) {
            case 'Most-Valuables-First-Fit':
              if (solverMVFF.placementSolution != undefined) {
                ans = {
                  'Algorithm': 'Most-Valuables-First-Fit',
                  'PlacementSolution': solverMVFF.placementSolution,
                  'HostUtilisation': solverMVFF.placementHostUtilisation['HostUtilisation']
                }
              }
              break

            case 'Most-Valuables-Best-Fit':
              if (solverMVBF.placementSolution != undefined) {
                ans = {
                  'Algorithm': 'Most-Valuables-Best-Fit',
                  'PlacementSolution': solverMVBF.placementSolution,
                  'HostUtilisation': solverMVBF.placementHostUtilisation['HostUtilisation']
                }
              }
              break

            case 'Most-Valuables-Worst-Fit':
              if (solverMVWF.placementSolution != undefined) {
                ans = {
                  'Algorithm': 'Most-Valuables-Worst-Fit',
                  'PlacementSolution': solverMVWF.placementSolution,
                  'HostUtilisation': solverMVWF.placementHostUtilisation['HostUtilisation']
                }
              }
              break


            case 'Genetic-Algorithm':
              if (solverGA.arrSolutionHistory.length > 0) {
                x1 = solverGA.arrSolutionHistory[solverGA.arrSolutionHistory.length - 1]
                ans = {
                  'Algorithm': 'Genetic-Algorithm',
                  'PlacementSolution': x1['BestChromosome'],
                  'HostUtilisation': x1['HostUtilisation']
                }
              }
              break
          }
      }
      break

    default:
      ans += ` => Unknown Message Type => ${req.body.MessageType} !!!`
  }

  return res.json({ 'Message': ans });
})

///////////////////////////////////////////////////////////////////////////////
*/

// {
//   "MessageType": "Setting",
//   "Algorithms": [
//     {
//       "Name": "Most-Valuables-First-Fit"
//     },
//     {
//       "Name": "Most-Valuables-Best-Fit"
//     },
//     {
//       "Name": "Most-Valuables-Worst-Fit"
//     },
//     {
//       "Name": "Genetic-Algorithm",
//       "Params": {
//         "PopulationSize": 100,
//         "OptimizationParameters": {
//           "ElitismPercentage": 0.1,
//           "CrossoverProbability": 1.0,
//           "MutationProbability": 0.01,
//           "HealingMethod": "SmartTrim-Fill",
//           "OverProductionFactor": 1.5
//         },
//         "TerminationPolicies": {
//           "MaxTotalNumberOfIterations": 1000,
//           "MaxNumberOfUnchangedBestAnswer": 50
//         }
//       }
//     }
//   ],
//   "K8Hosts": [
//     {
//       "HostID": "Host-1",
//       "CpuCapacityMIPS": 4000,
//       "MemCapacityMB": 4000,
//       "NetCapacityKbps": 1000000
//     }
//   ],
//   "K8Jobs": [
//     {
//       "JobID": "Job-1",
//       "JobValue": 20,
//       "CpuRequestMIPS": 2592,
//       "MemRequestMB": 2242,
//       "NetRequestKbps": 55961
//     }
//   ]
// }

