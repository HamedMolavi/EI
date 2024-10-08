const { Evented } = require("../utils/queue")

class K8Host {
  constructor({ id, ip, cpu, mem, net }) {
    this.id = id
    this.ip = ip
    this.cpu = cpu
    this.mem = mem
    this.net = net
    this.q = [];
    this.context = new Context(this);
    this.context.on("finish", () => {
      const job = this.q.pop();
      if (!!job) return this.context.set(job);
      const tempTimer = setInterval(() => {
        const job = this.q.pop();

        if (!!job) {
          this.context.set(job);
          clearInterval(tempTimer);
        }
      }, 100);
    })
    const tempTimer = setInterval(() => {
      const job = this.q.pop();
      if (!!job) {
        this.context.set(job);
        clearInterval(tempTimer);
      }
    }, 100);
  }

  execute(job) {
    this.q.push(job)
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
  }

  set(job) {
    console.log("running job request")
    if (!!this.ctx.length) return false;
    this.ctx.push(job);
    this._triggerEvent("set", job);
    console.log("running job")
    // execute job
    setTimeout(() => {
      console.log("finish job")
      this.ctx.pop();
      this._triggerEvent("finish", job);
    }, 1000 * job.cpu / this.host.cpu);
    return true;
  }

}

module.exports = {
  K8Host
}