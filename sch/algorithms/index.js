const clone = require('clone');
const { K8Host } = require('../cluster/host');
const { K8Job } = require('../cluster/job');


class PlacementSolution {
  constructor(array, value) {
    this.array = clone(array)
    this.value = value
  }
  toJSON() {
    return (
      {
        'array': this.array,
        'value': this.value
      }
    )
  }
}

class PlacementAlgorithm {
  constructor() {
    this.hosts = []
    this.jobs = []
  }

  ImportK8HostsAndJobs({ K8Hosts, K8Jobs }) {
    // this.hosts = []
    // this.jobs = []

    K8Hosts.forEach(k8host => {
      this.hosts.push(
        new K8Host(
          k8host['id'],
          k8host['cpu'],
          k8host['mem'],
          k8host['net']
        )
      )
    })

    K8Jobs.forEach(k8job => {
      this.jobs.push(
        new K8Job(
          k8job['id'],
          k8job['value'],
          k8job['cpu'],
          k8job['mem'],
          k8job['net']
        )
      )
    })
  }

  CheckConstraints(placementArray) {
    let cpuTotalUsage = Array(this.hosts.length).fill(0);
    let memTotalUsage = Array(this.hosts.length).fill(0);
    let netTotalUsage = Array(this.hosts.length).fill(0);
    let cpuFreeCapacity = this.hosts.map((host) => host.cpu);
    let memFreeCapacity = this.hosts.map((host) => host.mem);
    let netFreeCapacity = this.hosts.map((host) => host.net);

    for (const [jobIndex, hostIndex] of placementArray.entries()) {
      if (hostIndex != -1) {
        cpuTotalUsage[hostIndex] += this.jobs[jobIndex].cpu;
        memTotalUsage[hostIndex] += this.jobs[jobIndex].mem;
        netTotalUsage[hostIndex] += this.jobs[jobIndex].net;

        cpuFreeCapacity[hostIndex] -= this.jobs[jobIndex].cpu;
        memFreeCapacity[hostIndex] -= this.jobs[jobIndex].mem;
        netFreeCapacity[hostIndex] -= this.jobs[jobIndex].net;
      }
    }

    let flag = !this.hosts.some((host, i) => cpuTotalUsage[i] > host.cpu || memTotalUsage[i] > host.mem || netTotalUsage[i] > host.net)
    let fullReport = {
      'CpuTotalUsage': cpuTotalUsage,
      'MemTotalUsage': memTotalUsage,
      'NetTotalUsage': netTotalUsage,

      'CpuTotalCapacity': this.hosts.map(hh => hh.cpu),
      'MemTotalCapacity': this.hosts.map(hh => hh.mem),
      'NetTotalCapacity': this.hosts.map(hh => hh.net),

      'CpuFreeCapacity': cpuFreeCapacity,
      'MemFreeCapacity': memFreeCapacity,
      'NetFreeCapacity': netFreeCapacity
    };

    return [flag, fullReport];
  }

  Calculatevalue(placementArray) {
    return placementArray.reduce((res, jobIndex)=> res + (jobIndex != -1 ? this.jobs[jobIndex].value : 0), 0);
  }

  CalculateHostUtilisation(placementArray) {
    let ans = {}
    let fullReport
    let x1

    fullReport = this.CheckConstraints(placementArray)[1];

    for (x1 = 0; x1 < this.hosts.length; x1++) {
      ans[this.hosts[x1].id] = {}
      ans[this.hosts[x1].id]['CpuTotalUsage'] = fullReport['CpuTotalUsage'][x1]
      ans[this.hosts[x1].id]['CpuFreeCapacity'] = fullReport['CpuFreeCapacity'][x1]
      ans[this.hosts[x1].id]['CpuTotalCapacity'] = fullReport['CpuTotalCapacity'][x1]

      ans[this.hosts[x1].id]['MemTotalUsage'] = fullReport['MemTotalUsage'][x1]
      ans[this.hosts[x1].id]['MemFreeCapacity'] = fullReport['MemFreeCapacity'][x1]
      ans[this.hosts[x1].id]['MemTotalCapacity'] = fullReport['MemTotalCapacity'][x1]

      ans[this.hosts[x1].id]['NetTotalUsage'] = fullReport['NetTotalUsage'][x1]
      ans[this.hosts[x1].id]['NetFreeCapacity'] = fullReport['NetFreeCapacity'][x1]
      ans[this.hosts[x1].id]['NetTotalCapacity'] = fullReport['NetTotalCapacity'][x1]
    }

    return (ans)
  }
}


module.exports = {
  PlacementSolution,
  PlacementAlgorithm
}