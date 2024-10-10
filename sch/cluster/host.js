const { Evented } = require("../utils/queue")

class K8Host {
  constructor({ id, ip, cpu, mem, net }) {
    this.id = id
    this.ip = ip
    this.cpu = cpu
    this.mem = mem
    this.net = net
    this.context = new Context(this);
  }

  execute(job) {
    return new Promise((res)=>{
      const id = job.id;
      if (!!job.emit?.call) this.context.on(`finish${id}`, job.emit);
      this.context.on(`finish${id}`, res);
      this.context.set(job);
    })
  }

  toJSON() {
    return (
      {
        'id': this.id,
        'ip': this.ip,
        'cpu': this.cpu,
        'mem': this.mem,
        'net': this.net
      }
    )
  }
}



class Context extends Evented {
  constructor(host) {
    super();
    this.host = host;
    this.ctx = [];
    this.loop();
  }

  set(job) {
    this.ctx.push(job);
    this._triggerEvent("set", job);
    this._triggerEvent(`set${job.id}`, job);
    return true;
  }

  async loop() {
    while (true) {
      const job = this.ctx.shift();
      if (!!job) {
        await new Promise((res) => {
          // execute job
          setTimeout(() => {
            let result = {...job.toJSON(), time: 1000 * job.cpu / this.host.cpu};
            this._triggerEvent("finish", result);
            this._triggerEvent(`finish${job.id}`, result);
            res(result);
          }, 1000 * job.cpu / this.host.cpu);
        })
      }
      await new Promise((res) => setTimeout(res, 100));
    }
  }
}


module.exports = {
  K8Host
}