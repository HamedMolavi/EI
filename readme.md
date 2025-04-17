# Scheduler

## Host Class

## Task Class

## Scheduler Class

## Strategy Class

## Queue Class

## Task execution procedure

1. New task comes and added.  
`scheduler.addTask(task)` => `this.queue.addTask(task)`
2. Dispatching tasks in a regular time.  
`scheduler.dispatch()` => `this.strategy.selectTaskHostMappings(this.queue, this.hosts)` => `host.execute(task)`  
`this.taskCompleteTime = GLOBAL_TIME.value + this.transmissionDelay + expectedExecutionT`  
`task.started()` => `taskEventEmitter.emit({type: TaskState.STARTED,task: this,timestamp: GLOBAL_TIME.value})`
3. Checking completion on each timestep.  
`if (GLOBAL_TIME.value >= host.taskCompleteTime) task.completed()`  
4. Compeleted task.  
`taskEventEmitter.emit({type: TaskState.COMPLETED,task: this,timestamp: GLOBAL_TIME.value})`  
`this.strategy.handleTaskCompletion(event.task)`  
`// Send results back to User`
