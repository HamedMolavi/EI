const random = require('random');

const mapper = {
  'NORMAL': random.normal,
  'UNIFORM': random.uniform
}

class K8Job {
  constructor({ id, type, value, cpu, mem, net, sigma }) {
    this.id = id
    this.type = type
    this.value = value
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
    // this.cpu = cpu
    this.cpu = Math.ceil(this.distribution());
  }

  toJSON() {
    return (
      {
        'id': this.id,
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