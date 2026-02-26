import heapq
from typing import List
from core.event import Event, EVENT_ARRIVAL, EVENT_START, EVENT_FINISH
from core.task import Task
from core.host import Host
from policies.base import SchedulingPolicy

class PolicyReplaySimulator:
    """
    Deterministic replay of arrivals + execution times,
    but host selection is done by a scheduling policy.
    """

    def __init__(
        self,
        tasks: List[Task],
        hosts: List[Host],
        policy: SchedulingPolicy
    ):
        self.tasks = sorted(tasks, key=lambda t: t.arrival_time)
        self.hosts = hosts
        self.policy = policy

        self.event_q = []
        self.now = 0.0
        self.completed_tasks: List[Task] = []

    # -----------------------

    def schedule_event(self, time, kind, payload):
        heapq.heappush(self.event_q, Event(time, kind, payload))

    # -----------------------

    def run(self):
        for task in self.tasks:
            self.schedule_event(task.arrival_time, EVENT_ARRIVAL, task)

        while self.event_q:
            ev = heapq.heappop(self.event_q)
            self.now = ev.time

            if ev.kind == EVENT_ARRIVAL:
                self.handle_arrival(ev.payload)
            elif ev.kind == EVENT_START:
                self.handle_start(ev.payload)
            elif ev.kind == EVENT_FINISH:
                self.handle_finish(ev.payload)

    # -----------------------

    def handle_arrival(self, task: Task):
        host_id = self.policy.select_host(task, self.hosts, self.now)

        if host_id is None:
            task.dropped = True
            self.completed_tasks.append(task)
            return

        host = self.hosts[host_id]
        task.assigned_host = host_id
        host.queue.append(task)

        if host.is_idle(self.now):
            self.schedule_event(self.now, EVENT_START, host)

    # -----------------------

    def handle_start(self, host: Host):
        if not host.queue:
            return

        task = host.queue.pop(0)

        if self.now > task.deadline_time and task.is_hard:
            task.dropped = True
            self.completed_tasks.append(task)
            return

        duration = task.execution_time / host.speed

        task.start_time = self.now
        task.finish_time = self.now + duration

        host.current_task = task
        host.busy_until = task.finish_time

        self.schedule_event(task.finish_time, EVENT_FINISH, host)

    # -----------------------

    def handle_finish(self, host: Host):
        task = host.current_task
        host.current_task = None

        self.completed_tasks.append(task)

        if host.queue:
            self.schedule_event(self.now, EVENT_START, host)
