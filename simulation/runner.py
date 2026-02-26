from email.mime import base

from core.task_type_loader import load_task_types
from core.host import Host
from core.scheduler import Simulator
from core.replay import ReplayTaskLoader
from core.replay_scheduler import PolicyReplaySimulator
from policies.shortest_queue import ShortestQueuePolicy
from metrics.report import generate_report
from policies.reservation import ReservationPolicy

MODE = "simulate"   # or "replay"
TRACE_PATH = "task_trace.jsonl"


def make_hosts():
  return [
      Host(0, speed=1.0),
      Host(1, speed=1.0),
      Host(2, speed=1.0),
  ]
  return [Host(i, speed=1.0) for i in range(100)]


def main():
  task_type_ids = [
      "worker1",
      # "worker2",
      # "worker3",
  ]

  task_types = load_task_types(task_type_ids)
  hosts = make_hosts()
  if MODE == "simulate":
    sim = Simulator(
        task_types=task_types,
        hosts=hosts,
        policy=ReservationPolicy(
          hosts=hosts, reserve_count=1, load_threshold=0.85, base_policy=ShortestQueuePolicy()),
        # policy=ShortestQueuePolicy(),
        hard_prob=0.5,
        max_completed=1000,
        seed=12,
        trace_path=TRACE_PATH
    )
    sim.run()
    tasks = sim.completed_tasks
    report = generate_report(sim.rejected, tasks)
    print(report)
  # else:
  #   loader = ReplayTaskLoader(TRACE_PATH, task_types)
  #   tasks = loader.load()

  #   replay = PolicyReplaySimulator(
  #       tasks=tasks,
  #       hosts=hosts,
  #       policy=ShortestQueuePolicy()
  #   )
  #   replay.run()
  #   tasks = replay.completed_tasks


if __name__ == "__main__":
  main()
