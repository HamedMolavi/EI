const axios = require('axios');

function sendAxiosPost(url, data) {
    axios.post(url, data)
        .then((res) => {
            if (res.data.Message.DataPoints == null) {
                //console.log(JSON.stringify(res.data, undefined, 3));
                console.log(res.data);
            } else {
                //console.log(JSON.stringify(res.data.Message.DataPoints, undefined, 3));
                console.log(res.data.Message.DataPoints);
            }
        })
        .catch((err) => {
            console.log(err);
        })
}

urlSolver = 'http://localhost:3000/json'

sendAxiosPost(urlSolver, {
    MessageType: 'Setting',

    Algorithms: [
        {
            Name: 'Most-Valuables-First-Fit'
        },
        {
            Name: 'Most-Valuables-Best-Fit'
        },
        {
            Name: 'Most-Valuables-Worst-Fit'
        },
        {
            Name: 'Genetic-Algorithm',
            Params: {
                PopulationSize: 100,

                OptimizationParameters: {
                    ElitismPercentage: 0.1,
                    CrossoverProbability: 1.0,
                    MutationProbability: 0.01,
                    HealingMethod: 'SmartTrim-Fill',
                    //'None','Trim','Trim-Fill','SmartTrim-Fill'
                    OverProductionFactor: 1.5
                },

                TerminationPolicies: {
                    MaxTotalNumberOfIterations: 1000,
                    MaxNumberOfUnchangedBestAnswer: 50
                }
            }
        }
    ],
    //Capacity/Request => CPU:52%, MEM:51%, NET:48%
    K8Hosts:
        [
            {
                "HostID": "Host-1",
                "CpuCapacityMIPS": 4000,
                "MemCapacityMB": 4000,
                "NetCapacityKbps": 1000000
            },
            {
                "HostID": "Host-2",
                "CpuCapacityMIPS": 32000,
                "MemCapacityMB": 32000,
                "NetCapacityKbps": 1000000
            },
            {
                "HostID": "Host-3",
                "CpuCapacityMIPS": 8000,
                "MemCapacityMB": 8000,
                "NetCapacityKbps": 1000000
            },
            {
                "HostID": "Host-4",
                "CpuCapacityMIPS": 8000,
                "MemCapacityMB": 8000,
                "NetCapacityKbps": 1000000
            }
        ]
    ,
    K8Jobs:
        [
            {
                "JobID": "Job-1",
                "JobValue": 20,
                "CpuRequestMIPS": 2592,
                "MemRequestMB": 2242,
                "NetRequestKbps": 55961
            },
            {
                "JobID": "Job-2",
                "JobValue": 96,
                "CpuRequestMIPS": 1042,
                "MemRequestMB": 3534,
                "NetRequestKbps": 184172
            },
            {
                "JobID": "Job-3",
                "JobValue": 80,
                "CpuRequestMIPS": 2484,
                "MemRequestMB": 994,
                "NetRequestKbps": 174566
            },
            {
                "JobID": "Job-4",
                "JobValue": 79,
                "CpuRequestMIPS": 3651,
                "MemRequestMB": 776,
                "NetRequestKbps": 80893
            },
            {
                "JobID": "Job-5",
                "JobValue": 18,
                "CpuRequestMIPS": 3806,
                "MemRequestMB": 3256,
                "NetRequestKbps": 126912
            },
            {
                "JobID": "Job-6",
                "JobValue": 8,
                "CpuRequestMIPS": 855,
                "MemRequestMB": 2063,
                "NetRequestKbps": 76386
            },
            {
                "JobID": "Job-7",
                "JobValue": 57,
                "CpuRequestMIPS": 1248,
                "MemRequestMB": 2520,
                "NetRequestKbps": 88566
            },
            {
                "JobID": "Job-8",
                "JobValue": 64,
                "CpuRequestMIPS": 2150,
                "MemRequestMB": 2939,
                "NetRequestKbps": 184641
            },
            {
                "JobID": "Job-9",
                "JobValue": 50,
                "CpuRequestMIPS": 1509,
                "MemRequestMB": 2388,
                "NetRequestKbps": 199306
            },
            {
                "JobID": "Job-10",
                "JobValue": 42,
                "CpuRequestMIPS": 1434,
                "MemRequestMB": 3402,
                "NetRequestKbps": 184049
            },
            {
                "JobID": "Job-11",
                "JobValue": 52,
                "CpuRequestMIPS": 2387,
                "MemRequestMB": 2781,
                "NetRequestKbps": 23215
            },
            {
                "JobID": "Job-12",
                "JobValue": 69,
                "CpuRequestMIPS": 1789,
                "MemRequestMB": 2714,
                "NetRequestKbps": 124740
            },
            {
                "JobID": "Job-13",
                "JobValue": 16,
                "CpuRequestMIPS": 1122,
                "MemRequestMB": 2448,
                "NetRequestKbps": 172595
            },
            {
                "JobID": "Job-14",
                "JobValue": 88,
                "CpuRequestMIPS": 1116,
                "MemRequestMB": 2030,
                "NetRequestKbps": 150907
            },
            {
                "JobID": "Job-15",
                "JobValue": 50,
                "CpuRequestMIPS": 1472,
                "MemRequestMB": 1889,
                "NetRequestKbps": 116369
            },
            {
                "JobID": "Job-16",
                "JobValue": 95,
                "CpuRequestMIPS": 3336,
                "MemRequestMB": 1865,
                "NetRequestKbps": 67784
            },
            {
                "JobID": "Job-17",
                "JobValue": 12,
                "CpuRequestMIPS": 1504,
                "MemRequestMB": 3613,
                "NetRequestKbps": 81682
            },
            {
                "JobID": "Job-18",
                "JobValue": 48,
                "CpuRequestMIPS": 3237,
                "MemRequestMB": 1862,
                "NetRequestKbps": 169096
            },
            {
                "JobID": "Job-19",
                "JobValue": 13,
                "CpuRequestMIPS": 1295,
                "MemRequestMB": 2595,
                "NetRequestKbps": 100702
            },
            {
                "JobID": "Job-20",
                "JobValue": 18,
                "CpuRequestMIPS": 2904,
                "MemRequestMB": 2758,
                "NetRequestKbps": 101786
            },
            {
                "JobID": "Job-21",
                "JobValue": 73,
                "CpuRequestMIPS": 885,
                "MemRequestMB": 2570,
                "NetRequestKbps": 67151
            },
            {
                "JobID": "Job-22",
                "JobValue": 64,
                "CpuRequestMIPS": 854,
                "MemRequestMB": 2509,
                "NetRequestKbps": 46536
            },
            {
                "JobID": "Job-23",
                "JobValue": 64,
                "CpuRequestMIPS": 3173,
                "MemRequestMB": 925,
                "NetRequestKbps": 98304
            },
            {
                "JobID": "Job-24",
                "JobValue": 72,
                "CpuRequestMIPS": 1539,
                "MemRequestMB": 1608,
                "NetRequestKbps": 53413
            },
            {
                "JobID": "Job-25",
                "JobValue": 4,
                "CpuRequestMIPS": 3553,
                "MemRequestMB": 3274,
                "NetRequestKbps": 143940
            },
            {
                "JobID": "Job-26",
                "JobValue": 1,
                "CpuRequestMIPS": 3824,
                "MemRequestMB": 2343,
                "NetRequestKbps": 19350
            },
            {
                "JobID": "Job-27",
                "JobValue": 41,
                "CpuRequestMIPS": 1030,
                "MemRequestMB": 3595,
                "NetRequestKbps": 19401
            },
            {
                "JobID": "Job-28",
                "JobValue": 6,
                "CpuRequestMIPS": 2124,
                "MemRequestMB": 1993,
                "NetRequestKbps": 31746
            },
            {
                "JobID": "Job-29",
                "JobValue": 40,
                "CpuRequestMIPS": 2855,
                "MemRequestMB": 1213,
                "NetRequestKbps": 156961
            },
            {
                "JobID": "Job-30",
                "JobValue": 96,
                "CpuRequestMIPS": 628,
                "MemRequestMB": 3608,
                "NetRequestKbps": 47242
            },
            {
                "JobID": "Job-31",
                "JobValue": 45,
                "CpuRequestMIPS": 2737,
                "MemRequestMB": 2108,
                "NetRequestKbps": 187416
            },
            {
                "JobID": "Job-32",
                "JobValue": 28,
                "CpuRequestMIPS": 3898,
                "MemRequestMB": 2380,
                "NetRequestKbps": 19154
            },
            {
                "JobID": "Job-33",
                "JobValue": 5,
                "CpuRequestMIPS": 848,
                "MemRequestMB": 806,
                "NetRequestKbps": 23213
            },
            {
                "JobID": "Job-34",
                "JobValue": 45,
                "CpuRequestMIPS": 2901,
                "MemRequestMB": 2689,
                "NetRequestKbps": 96064
            },
            {
                "JobID": "Job-35",
                "JobValue": 73,
                "CpuRequestMIPS": 1469,
                "MemRequestMB": 3763,
                "NetRequestKbps": 15606
            },
            {
                "JobID": "Job-36",
                "JobValue": 63,
                "CpuRequestMIPS": 2405,
                "MemRequestMB": 3163,
                "NetRequestKbps": 126423
            },
            {
                "JobID": "Job-37",
                "JobValue": 36,
                "CpuRequestMIPS": 3629,
                "MemRequestMB": 2195,
                "NetRequestKbps": 119048
            },
            {
                "JobID": "Job-38",
                "JobValue": 1,
                "CpuRequestMIPS": 2526,
                "MemRequestMB": 1117,
                "NetRequestKbps": 185705
            },
            {
                "JobID": "Job-39",
                "JobValue": 17,
                "CpuRequestMIPS": 2084,
                "MemRequestMB": 3492,
                "NetRequestKbps": 35699
            },
            {
                "JobID": "Job-40",
                "JobValue": 75,
                "CpuRequestMIPS": 1656,
                "MemRequestMB": 1356,
                "NetRequestKbps": 52125
            }
        ]
})

sendAxiosPost(urlSolver, {
    MessageType: 'Command',
    SolverCommand: 'DeleteAllData'
})

sendAxiosPost(urlSolver, {
    MessageType: 'Command',
    SolverCommand: 'Start',
    SolverName: 'Most-Valuables-First-Fit'
})

sendAxiosPost(urlSolver, {
    MessageType: 'Command',
    SolverCommand: 'Start',
    SolverName: 'Most-Valuables-Best-Fit'
})

sendAxiosPost(urlSolver, {
    MessageType: 'Command',
    SolverCommand: 'Start',
    SolverName: 'Most-Valuables-Worst-Fit'
})


sendAxiosPost(urlSolver, {
    MessageType: 'Command',
    SolverCommand: 'Start',
    SolverName: 'Genetic-Algorithm'
})

setTimeout(() => {

    sendAxiosPost(urlSolver, {
        MessageType: 'Command',
        SolverCommand: 'Fetch-Solution',
        SolverName: 'Most-Valuables-First-Fit'
    })

    sendAxiosPost(urlSolver, {
        MessageType: 'Command',
        SolverCommand: 'Fetch-Solution',
        SolverName: 'Most-Valuables-Best-Fit'
    })

    sendAxiosPost(urlSolver, {
        MessageType: 'Command',
        SolverCommand: 'Fetch-Solution',
        SolverName: 'Most-Valuables-Worst-Fit'
    })


    sendAxiosPost(urlSolver, {
        MessageType: 'Command',
        SolverCommand: 'Fetch-Solution',
        SolverName: 'Genetic-Algorithm'
    })
}, 5000)

