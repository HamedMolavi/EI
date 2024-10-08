const random = require('random');

const mapper = {
  'NORMAL': random.normal,
  'UNIFORM': random.uniform
}

class K8Job {
  constructor({ type, value, cpu, mem, net, sigma }) {
    this.type = type
    this.value = value
    this.cpu = cpu
    this.mem = mem
    this.net = net
    const distribution = Object.keys(mapper).includes(process.env["DISTRIBUTION"]?.toUpperCase()) ? process.env["DISTRIBUTION"]?.toUpperCase() : 'NORMAL';
    const param1 = {
      'NORMAL': cpu,
      'UNIFORM': cpu - sigma
    }[distribution];
    const param2 = {
      'NORMAL': sigma,
      'UNIFORM': cpu + sigma
    }[distribution];
    this.distribution = mapper[distribution](param1, param2)
  }

  toJSON() {
    return (
      {
        'type': this.type,
        'value': this.value,
        'cpu': this.cpu,
        'mem': this.mem,
        'net': this.net
      }
    )
  }
}




module.exports = {
  K8Job
}