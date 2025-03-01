const TIME_SLOT = 1;
//////////////////////////
let scheduler_queue = [{ id: 1, cpu: 10, mem: 0.5, net: 5 }]
let hosts = [{ id: 1, cpu: 100, mem: 16, net: 1000, queue: [], ctx: null }];
let time = 0;
//////////////////////////
function roundRobin() {

}


while (true) {
    ////
    // check hosts
    hosts.forEach(host => {
        // check if exec job is finished
        // if (!!host.ctx && host.ctx.job) { }
        // check if there is job to exec
        if (!host.ctx && !!host.queue.length) {
            const job = host.queue.shift();
            host.ctx = job;
        }
    });

    // check jobs
    scheduler_queue.splice(0).forEach(job => {

    })

    ////
    time += TIME_SLOT;
}