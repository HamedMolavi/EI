const random = new (require("random")).Random();
const isIt = random.uniformBoolean();
//////////////////////
// let { group, isSoftDeadline } = isIt() ? { group: "sensitive", isSoftDeadline: isIt() } : { group: "insensitive" };
const TASK_TYPES = [
    { type: 'image_processing', mem: 0.1, net: 2.5, cpu: 10, deadline: 10, sensitive: true, isSoftDeadline: true },
];
const HOW_MANY_TASKS_IN_A_TIMESLOT_FUNCTION = random.uniformInt(0, 10);
const TIME_SLOT = 1;
const HOSTS = [new Host(1, 50), new Host(2, 70)];
//////////////////////
let time = 0;

class Task {
    constructor(id, mem, net, sampleExecutionTime, sensitive, isSoftDeadline, deadline) {
        this.id = id;
        this.mem = mem;
        this.net = net;
        this.sampleExecutionTime = sampleExecutionTime;
        this.sensitive = sensitive;
        this.isSoftDeadline = isSoftDeadline;
        this.deadline = deadline;

        this.startTime = null;
    }
}

class Host {
    constructor(id, transmissionDelay) {
        this.id = id;
        this.transmissionDelay = transmissionDelay;
        this.currentTask = null;
        this.taskReceivedTime = null;
    }

    receiveTask(task) {
        this.currentTask = task;
        this.taskReceivedTime = time;
    }

    checkCompleted() {
        let task = this.currentTask;
        const expectedExecutionTime = task?.sampleExecutionTime();
        if (!!task &&
            (time - this.taskReceivedTime) >= (this.transmissionDelay + expectedExecutionTime)) {

            if (time <= task.deadline) {
                this.reward += expectedExecutionTime * 1.5;
            } else if (task.isSoftDeadline) {
                this.cost += (time - task.deadline) * 0.5;
            } else {
                this.cost += 100;
                console.log(`Task ${task.id} missed hard deadline and was aborted.`);
            }
            console.log(`Host ${this.id} completed task ${task.id} at time ${time}`);
            this.currentTask = null;
        }
    }
}

class Scheduler {
    constructor(hosts) {
        this.hosts = hosts;
        this.queueSensitive = [];
        this.queueInsensitive = [];
        this.reward = 0;
        this.cost = 0;
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
            if (host.currentTask && (time - host.taskReceivedTime) >= host.transmissionDelay) {
                let task = host.currentTask;
                let elapsed = time - task.startTime;
                let expectedExecutionTime = task.sampleExecutionTime();
                let probabilityOfCompletion = Math.min(1, elapsed / expectedExecutionTime);

                if (Math.random() < probabilityOfCompletion) {
                    if (time <= task.deadline) {
                        this.reward += expectedExecutionTime * 1.5;
                    } else if (task.isSoftDeadline) {
                        this.cost += (time - task.deadline) * 0.5;
                    } else {
                        this.cost += 100;
                        console.log(`Task ${task.id} missed hard deadline and was aborted.`);
                    }
                    console.log(`Host ${host.id} completed task ${task.id} at time ${time}`);
                    host.currentTask = null;
                }
            }
        });
    }

    schedule() {
        let freeHosts = this.hosts.filter(h => !h.currentTask && !h.pendingTask);
        while (freeHosts.length > 0) {
            let task = this.selectTask();
            if (!task) break;
            let host = freeHosts.shift();
            host.receiveTask(task);
        }
        this.evaluateSystemLoad();
        console.log(`Current Reward: ${this.reward}, Current Cost: ${this.cost}`);
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
        console.log(`System Load: ${label}`);
    }
}

const scheduler = new Scheduler(HOSTS);

function generateRandomTask(type) {
    let id = Math.floor(Math.random() * 1000);
    let dist = random.poisson((lambda = type.cpu));
    let deadline = type.sensitive ? time + type.deadline : +inf;
    return new Task(id, type.type, type.mem, type.net, dist, type.sensitive, type.isSoftDeadline, deadline);
}

function randomTaskArrival() {
    const j = HOW_MANY_TASKS_IN_A_TIMESLOT_FUNCTION();
    for (let i = 0; i < j; i++) {
        const type = random.choice(TASK_TYPES);
        let task = generateRandomTask(type);
        console.log(`New task arrived: ${task.id}, Group: ${task.sensitive ? 'sensitive with deadline' + task.deadline : 'insensitive'} at time ${time}`);
        scheduler.addTask(task);
    }
}

while (time < 10000) { // Simulate an arbitrary amount of time
    randomTaskArrival();
    scheduler.checkHosts();
    scheduler.schedule();
    time += TIME_SLOT;
}
for (let index = 0; index < array.length; index++) {
    const element = array[index];

}
