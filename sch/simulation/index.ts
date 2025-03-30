//sudo perf stat -e cycles python3 test.py

import { Random } from "random";

const random = new Random();
// const random = new (require("random")).Random();
const isIt = random.uniformBoolean();

class Task {
    constructor(
        public id: number,
        public type: string,
        public mem: number,
        public net: number,
        public cpuDistribution: () => number,
        public sensitive: boolean,
        public isSoftDeadline: boolean,
        public deadlineT: number
    ) {
        this.id = id;
        this.type = type;
        this.mem = mem;
        this.net = net;
        this.cpuDistribution = cpuDistribution;
        this.sensitive = sensitive;
        this.isSoftDeadline = isSoftDeadline;
        let deadlineTime = sensitive ? time + deadlineT : +Infinity;
        this.deadlineTime = deadlineTime;

        this.arriveTime = time;
        this.startTime = null;
        this.completeTime = null;
    }
}

class Host {
    constructor(id, mem, net, cpu, transmissionDelay) {
        this.id = id;
        this.mem = mem; this.net = net; this.cpu = cpu;
        this.transmissionDelay = transmissionDelay;
        this.currentTask = null;
        this.taskReceivedTime = null;
        this.taskCompleteTime = +Infinity;
        this.reward = 0;
        this.penalty = 0;
    }

    receiveTask(task) {
        this.currentTask = task;
        this.taskReceivedTime = time;
        const expectedCpuUsage = task.cpuDistribution();
        console.log(expectedCpuUsage)
        const expectedExecutionT = (expectedCpuUsage / this.cpu) * 1000; //ms
        this.taskCompleteTime = time + this.transmissionDelay + expectedExecutionT;
        console.log(`Host ${this.id}: Received task ${task.id}, complete expctation at ${this.taskCompleteTime}`);
    }

    checkCompleted() {
        let task = this.currentTask;
        let r;
        if (!!task) {
            if (time >= this.taskCompleteTime) {
                task.completeTime = this.taskCompleteTime;
                if (task.sensitive) {
                    r = REWARDS[`${task.isSoftDeadline ? 'soft' : 'hard'}-sensitive-${time >= task.deadlineTime ? 'violate' : 'complete'}`](task);
                    if (r > 0) this.reward += r;
                    else this.penalty += r;
                } else {
                    r = REWARDS['insensitive'](task);
                    this.reward += r;
                }
                console.log(`Host ${this.id}: Completed task ${task.id} at time ${time}`);
                this.currentTask = null;
            } else if (task.sensitive && !task.isSoftDeadline && time >= task.deadlineTime) {
                console.log(`Host ${this.id}: Abort task ${task.id}, now ${time} - deadline ${task.deadlineTime}`);
                this.currentTask = null;
                r = REWARDS['hard-sensitive-violate'](task);
                this.penalty += r;
            }
        }
        return r;
    }
}

class Scheduler {
    constructor(hosts) {
        this.hosts = hosts;
        this.queueSensitive = [];
        this.queueInsensitive = [];
        this.reward = 0;
        this.penalty = 0;
    }

    addTask(task) {
        if (task.sensitive) {
            this.queueSensitive.push(task);
        } else {
            this.queueInsensitive.push(task);
        }
    }

    checkHosts() {
        this.hosts.forEach(host => {
            const r = host.checkCompleted();
            if (!!r && r > 0) this.reward += r;
            else if (!!r) this.penalty += r;
        });
    }

    schedule() {
        let freeHosts = this.hosts.filter(h => !h.currentTask);
        while (freeHosts.length > 0) {
            let task = this.selectTask();
            if (!task) break;
            let host = freeHosts.shift();
            host.receiveTask(task);
            task.startTime = time;
        }
        this.evaluateSystemLoad();
    }

    selectTask() {
        if (this.queueSensitive.length > 0) {
            return this.queueSensitive.shift();
        } else if (this.queueInsensitive.length > 0) {
            return this.queueInsensitive.shift();
        }
        return null;
    }

    evaluateSystemLoad() {
        let load = this.queueSensitive.length + this.queueInsensitive.length;
        let label = load > 5 ? "High Load" : "Normal Load";
        console.log(`Current Reward: ${this.reward}, Current Penalty: ${this.penalty}`);
        console.log(`System Load: ${label}`);
    }
}

//////////////////////
//mem: KB, net: Mib, cpu: Hz, deadlineT: ms
const TASK_TYPES = [
    {
        taskType: 'poisson_image_processing', mem: 256, net: 5, cpu: 28_000_000, deadlineT: 20, sensitive: true, isSoftDeadline: false,
        dist: random.poisson(28_000_000)
    },
    {
        taskType: 'normal_image_processing', mem: 256, net: 5, cpu: 28_000_000, deadlineT: 20, sensitive: true, isSoftDeadline: false,
        dist: random.normal(28_000_000, 5_000_000)
    },
];
const REWARDS = {
    'hard-sensitive-complete': () => 1,
    'hard-sensitive-violate': () => -1,
    'soft-sensitive-complete': () => 1,
    'soft-sensitive-violate': () => -1,
    'insensitive': () => 1,
}
const HOW_MANY_TASKS_IN_A_TIMESLOT_FUNCTION = random.uniformInt(0, 2);
const TIME_SLOT = 10; // ms
const MAX_TIME = 50; // ms
const HOSTS = [new Host(1, 16_777_216, 10_000, 3_500_000_000, 1), new Host(2, 16_777_216, 10_000, 3_500_000_000, 2)];
//////////////////////
let time = 0;
let lastTaskId = 0;
const scheduler = new Scheduler(HOSTS);

function generateRandomTask() {
    const type = random.choice(TASK_TYPES);
    lastTaskId += 1;
    return new Task(lastTaskId, type.taskType, type.mem, type.net, type.dist, type.sensitive, type.isSoftDeadline, type.deadlineT);
}

function randomTaskArrival() {
    const j = HOW_MANY_TASKS_IN_A_TIMESLOT_FUNCTION();
    const tasks = [];
    for (let i = 0; i < j; i++) {
        let task = generateRandomTask();
        console.log(`New task arrived: ${task.id}, Group: ${task.sensitive ? 'sensitive with deadline ' + task.deadlineTime + ' ms' : 'insensitive'} at time ${time}`);
        scheduler.addTask(task);
        tasks.push(task);
    }
    return tasks;
}

while (time <= MAX_TIME || scheduler.queueSensitive.length || scheduler.queueInsensitive.length) { // Simulate an arbitrary amount of time
    console.log('----', time)
    if (time <= MAX_TIME) randomTaskArrival();
    scheduler.checkHosts();
    scheduler.schedule();
    time += TIME_SLOT;
}
