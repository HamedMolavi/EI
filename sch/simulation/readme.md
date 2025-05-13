# Simulation Module

## Simulation Configuration (`index.ts`)

```ts
const TIME_SLOT = 10; // ms
const MAX_TIME = 50; // ms
const HOSTS = [
  new Host('1', 16_777_216, 10_000, 3_500_000_000, 1),
  new Host('2', 16_777_216, 10_000, 3_500_000_000, 2)
];
```

## Component Diagram

placeholder

## Components

### `index.ts`

#### phase 1: setup

First of all an instance of `Time` class defined in `time.ts` is created called `GLOBAL_TIME`. This class would help simulate time and notify clock change to any registered callbacks.

Starts `scheduler` from `scheduler.ts` with a list of `HOSTS` defined in the same file.  
Each host is an instance of `Host` defined in `host.ts`.

#### phase 2: retrieving tasks

The system runs within a while loop. On each iteration some random tasks get simulated using this call stack:  
`randomTaskArrival()` which chooses a random number of arrival tasks and calls `generateRandomTask()`  
in which we create an instance of `Task` from `task.ts`. The created task would be one of task types mentioned in `taskTypes.ts`.  
Then all the tasks will be added to the scheduler using `scheduler.addTask()`.

#### phase 3: dispatching tasks

At the end of an iteration since it is considered as a time slot, we perform `scheduler.dispatch()` to send tasks over to hosts to execute them.  
We also update timing.

### `host.ts`

Class of host, extends `BaseHost` from `../cluster/host`.  
Implements task execution logic.  
Uses `GLOBAL_TIME` for task completion tracking.  
It requires these parameters as input:

* id: string
* mem: number in Bytes
* net: number in Bytes
* cpu: number in Cycles
* transmissionDelay: number in ms

#### host methods

* `init()` This method initiates `currentTask`, `taskReceivedTime`, `taskCompleteTime`, `reward` and `penalty` properties.  
  It also registers `checkCompleted()` method to the clock change event.
* `execute(task: Task)` Mainly to simulate executing a task. The procedure works like this:
  * Set `currentTask`, `taskReceivedTime` and `taskCompleteTime` properties appropriately. To obtain `taskCompleteTime` we sample required CPU distribution and divide it CPU capacity of this host.
  * Call `task.started()` to notify the task that it has been started executing.
  * Register `checkCompleted()` method to the clock change event.
* `checkCompleted()` To check whether executing task has been completed or not. The procedure goes like this:
  * Empties `currentTask` if executing task has been canceled `task.state === TaskState.CANCELLED`.
  * Otherwise if executing task has been completed successfully `GLOBAL_TIME.value >= this.taskCompleteTime`
    * Calls to the `task.completed()` method.
    * Computes reward or penalty of executing that task based on delay sensitivity and deadline.
    * Empties `currentTask`.
  * There is another possibility that the executing task is hard delay sensitive and time has passed its deadline. In such case we should drop the task which has no point in executing it any more.
    * Computes reward or penalty of executing that task based on delay sensitivity and deadline.
    * Empties `currentTask`.

### `schedule.ts`

* Core orchestration component
* Manages task queues (sensitive and insensitive)
* Distributes tasks to available hosts (host allocation)
* Uses scheduling algorithms by strategy property
* Tracks system-wide performance metrics
* Implements reward/penalty calculation

Class of scheduler, extends `BaseScheduler` from `../cluster/scheduler`.  
It required these parameters as input:

* hosts: Host[] from `host.ts`
* strategy: Strategy from `strategies`
* queue: Queue from `queues`

#### scheduler methods

* `addTask(task: BaseTask)` Adds the task to scheduler queue using `queue.addTask` method.
* `init()` initiates `reward` and `penalty` properties with `0`.
* `evaluateSystemLoad()` assesses system load and returns either "High Load" or "Normal Load".
* `setStrategy(strategy: BaseStrategy)` sets the strategy of distributing tasks to hosts.
* `isBusyHost()` returns a boolean indicating if any of the hosts are busy executing a task.
* `updateRewards()`
* `dispatch()`
  * First analyzes that scheduler should dispatch tasks to hosts or not using `strategy.shouldDispatch(this.queue)` method.
  * Then retrives a mapping indicating which tasks should be sent to which host using `strategy.selectTaskHostMappings(this.queue, this.hosts)`  
  The returned mapping is of type `The Array of selected {task: Task, host: Host}`
  * Then iterates over the mapping and
    * First removes the task from scheduler queue with `queue.removeTask(task)` method.
    * Then sends it over to selected host with `host.execute(task)` method.
* `handleTaskCompletion(event: TaskEvent)` As any of dispatched tasks complete, an event would be generated and caught by scheduler. You can do what ever you want regarding completion of a task like clean up.

### `time.ts`

Implements observer pattern for time-based events. Used by `Host` for task completion tracking. Referenced in `index.ts` as `GLOBAL_TIME`  
Properties:

* `private _value: number = 0`
* `private listeners: ((newValue: number) => void)[] = []`

### `task.ts`

Task class Represents computational work and tracks a task lifecycle.  
Extends `BaseTask` from `../cluster/task`.  
It requires these input parameter:

* id: string
* type: string, forwarded from task type object
* arriveTime: number in ms
* value: number as reward value, forwarded from task type object
* cpu: number in cycles, forwarded from task type object
* mem: number in bytes, forwarded from task type object
* net: number in bytes, forwarded from task type object
* distribution: a function used to sample CPU, forwarded from task type object
* sensitive: boolean, forwarded from task type object
* isSoftDeadline: boolean, forwarded from task type object
* deadlineT: number in ms, forwarded from task type object

#### task methods

* `started()`
* `completed()`
* `canceled()`

## Technical Implementation Details

### Task Execution Flow

1. Task generation and send to scheduler in `index.ts`:

    ```ts
    const j = HOW_MANY_TASKS_IN_A_TIMESLOT_FUNCTION();
    for (let i = 0; i < j; i++) {
      const type = random.choice(Object.values(TASK_TYPES));
      const task = new Task(
        lastTaskId.toString(), type.taskType, GLOBAL_TIME.value,
        type.value, type.cpu, type.mem, type.net, type.dist,
        type.sensitive, type.isSoftDeadline, type.deadlineT);
      scheduler.addTask(task);
    }
    ```

2. Scheduler assign task to host in `scheduler.ts`:

    ```ts
    const mappings = this.strategy.selectTaskHostMappings(this.queue, this.hosts);
    for (const { task, host } of mappings) {
      // Remove task from appropriate queue
      this.queue.removeTask(task);
      // Dispatch the task
      host.execute(task);
    }
    ```

3. Host task execution in `host.ts`:

   ```ts
   execute(task: Task) {
    this.currentTask = task;
    this.taskReceivedTime = GLOBAL_TIME.value;
    const expectedCpuUsage = task.distribution();
    const expectedExecutionT = (expectedCpuUsage / this.cpu) * 1000;
    this.taskCompleteTime = GLOBAL_TIME.value + this.transmissionDelay + expectedExecutionT;
    task.started();
    const p = new Promise((res) => {
      GLOBAL_TIME.onChange(this.checkCompleted.bind(this))
    });
   }
   ```

4. Task completion checking in `host.ts`:

   ```ts
   checkCompleted() {
    if (task.state === TaskState.CANCELLED) {
      this.currentTask = undefined;
    } else if (GLOBAL_TIME.value >= this.taskCompleteTime) {
        task.completed();
        if (notViolated) this.reward += r;
        else this.penalty += r;
        this.currentTask = undefined;
    } else if (task.sensitive && !task.isSoftDeadline && GLOBAL_TIME.value >= task.deadlineTime) {
        this.currentTask = undefined;
        this.penalty += r;
    }
   }
   ```

<!-- ## Performance Metrics

- Task completion time tracking
- Deadline violation detection
- Reward/penalty accumulation
- Host utilization monitoring

## Technical Constraints

- Time slot: 10ms
- Maximum simulation time: 50ms
- Host resources:
  - Memory: 16,777,216 units
  - Network: 10,000 units
  - CPU: 3,500,000,000 units
  - Transmission delay: 1-2 units  -->