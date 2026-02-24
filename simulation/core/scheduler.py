import heapq
import json
import random
from typing import List
from core.event import Event, EVENT_ARRIVAL, EVENT_START, EVENT_FINISH
from core.task import Task
from core.task_type import TaskType
from core.host import Host
from policies.base import SchedulingPolicy


class Simulator:

  def __init__(
      self,
      task_types: List[TaskType],
      hosts: List[Host],
      policy: SchedulingPolicy,
      arrival_rate: float,
      hard_prob: float,
      max_completed: int,
      seed: int,
      trace_path: str
  ):
    self.task_types = task_types
    self.hosts = hosts
    self.policy = policy
    self.arrival_rate = arrival_rate
    self.hard_prob = hard_prob
    self.max_completed = max_completed

    self.rng = random.Random(seed)
    self.event_q = []
    self.now = 0.0
    self.task_id_counter = 0

    self.completed_tasks: List[Task] = []
    self.rejected = 0

    self.trace_file = open(trace_path, "w")

  # -----------------------
  def total_queue_length(self):
    return sum(len(h.queue) + (1 if h.current_task else 0) for h in self.hosts)

  def effective_arrival_rate(self):
    q = self.total_queue_length()
    return self.arrival_rate / (1 + q)

  def schedule_event(self, time, kind, payload):
    heapq.heappush(self.event_q, Event(time, kind, payload))

  def print_host_report(self):
    """
    Print a detailed snapshot of all hosts.
    """
    print("=" * 80)
    print(f"HOST REPORT @ time = {self.now:.4f}")
    print("=" * 80)

    for h in self.hosts:
      load = h.load(self.now)

      print(f"\nHost {h.host_id}")
      print(f"  Speed            : {h.speed}")
      print(f"  Estimated load   : {load:.4f}")
      print(f"  Queue length     : {len(h.queue)}")

      # -------------------------
      # Running task
      # -------------------------
      if h.current_task is None:
        print("  Running task     : IDLE")
      else:
        t = h.current_task
        remaining = max(0.0, h.busy_until - self.now)
        slack = t.deadline - h.busy_until

        print("  Running task     :")
        print(f"    Task ID        : {t.task_id}")
        print(f"    Type           : {t.task_type.id}")
        print(f"    Hard           : {t.is_hard}")
        print(f"    Remaining time : {remaining:.4f}")
        print(f"    Deadline       : {t.deadline:.4f}")
        print(f"    Slack          : {slack:.4f}")

      # -------------------------
      # Queue details
      # -------------------------
      if not h.queue:
        print("  Queue            : EMPTY")
      else:
        print("  Queue:")
        for i, q in enumerate(h.queue):
          est_service = q.task_type.mean / h.speed
          slack = q.deadline - (self.now + est_service)

          print(
              f"    [{i}] "
              f"id={q.task_id} "
              f"type={q.task_type.id} "
              f"hard={q.is_hard} "
              f"mean_svc={est_service:.4f} "
              f"deadline={q.deadline:.4f} "
              f"est_slack={slack:.4f}"
          )

    print("\n" + "=" * 80)
  # -----------------------

  def create_task(self) -> Task:
    tt = self.rng.choice(self.task_types)
    is_hard = self.rng.random() < self.hard_prob
    deadline = self.now + 1.5 * tt.mean
    # deadline = self.now + tt.mean

    task = Task(
        task_id=self.task_id_counter,
        arrival_time=self.now,
        task_type=tt,
        is_hard=is_hard,
        deadline=deadline
    )
    self.task_id_counter += 1
    return task

  # -----------------------

  def handle_arrival(self):
    self.print_host_report()
    task = self.create_task()
    # print(task.task_id, "Arrived:", self.now)
    host_id = self.policy.select_host(task, self.hosts, self.now)

    if host_id is None:
      self.rejected += 1
    else:
      host = self.hosts[host_id]
      task.assigned_host = host_id
      host.queue.append(task)

      if host.is_idle(self.now):
        self.schedule_event(self.now, EVENT_START, host)

    if self.task_id_counter < self.max_completed:
      # next_arrival = self.rng.expovariate(self.effective_arrival_rate())
      next_arrival = self.rng.expovariate(self.arrival_rate)
      self.schedule_event(self.now + next_arrival, EVENT_ARRIVAL, None)

  # -----------------------

  def handle_start(self, host: Host):
    if not host.queue:
      return

    task = host.queue.pop(0)
    # if self.now > task.deadline and task.is_hard:
    if self.now > task.deadline:
      task.dropped = True
      self.completed_tasks.append(task)
      self.schedule_event(self.now, EVENT_START, host)
      return

    task.execution_time = task.task_type.sample_execution_time(self.rng)
    duration = task.execution_time / host.speed

    task.start_time = self.now
    task.finish_time = self.now + duration

    host.current_task = task
    host.busy_until = task.finish_time
    # print(task.task_id, "START:", task.start_time,
    # task.finish_time, task.deadline)

    self.schedule_event(task.finish_time, EVENT_FINISH, host)

  # -----------------------

  def handle_finish(self, host: Host):
    task = host.current_task
    if task is not None:
      # print(task.task_id, "Finished:", task.start_time,
      #       task.finish_time, task.deadline)
      host.current_task = None

      self.completed_tasks.append(task)
      self.write_trace(task)

    if host.queue:
      self.schedule_event(self.now, EVENT_START, host)

  # -----------------------

  def write_trace(self, task: Task):
    record = {
        "task_id": task.task_id,
        "arrival_time": task.arrival_time,
        "task_type": task.task_type.id,
        "is_hard": task.is_hard,
        "deadline": task.deadline,
        "execution_time": task.execution_time,
        "assigned_host": task.assigned_host,
        "start_time": task.start_time,
        "finish_time": task.finish_time,
        "lateness": task.lateness(),
        "dropped": task.dropped,
    }
    self.trace_file.write(json.dumps(record) + "\n")

  # -----------------------

  def run(self):
    self.schedule_event(0.0, EVENT_ARRIVAL, None)

    while self.event_q:  # len(self.completed_tasks) < self.max_completed
      ev = heapq.heappop(self.event_q)
      self.now = ev.time

      if ev.kind == EVENT_ARRIVAL:
        self.handle_arrival()
      elif ev.kind == EVENT_START:
        self.handle_start(ev.payload)
      elif ev.kind == EVENT_FINISH:
        self.handle_finish(ev.payload)

    self.trace_file.close()
