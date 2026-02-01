from ast import Tuple
from typing import List, Optional, Set
from policies.base import SchedulingPolicy
from core.host import Host
from core.task import Task
from statistics.tail import conv_tail_probability, tail_probability


class ReservationPolicy(SchedulingPolicy):
  """
  Reserve hosts only for hard tasks, using empirical tail probabilities.
  """

  def __init__(
      self,
      hosts: List[Host],
      reserve_count: int = 1,
      tail_threshold: float = 0.2,
      load_threshold: float = 0.8,
  ):
    self.hosts = hosts
    self.fastest = sorted(self.hosts, key=lambda h: h.speed, reverse=True)
    self.reserve_count = reserve_count
    self.tail_threshold = tail_threshold
    self.load_threshold = load_threshold

    self.reserved_hosts: Set[int] = set()
    self._initialize_reserves()

  # -------------------------------------------------

  def _initialize_reserves(self):
    # Fastest hosts are candidates for reservation
    for i in range(self.reserve_count):
      self.reserved_hosts.add(self.fastest[i].host_id)

  # -------------------------------------------------

  def _host_load(self, host: Host, now: float) -> float:
    """
    Load estimate for a single host.
    """
    work = 0.0

    if host.current_task:
      work += max(0.0, host.busy_until - now)

    for q in host.queue:
      work += q.task_type.mean / host.speed

    return work

  # -------------------------------------------------

  def _update_reserves(self, now: float):
    """
    Reserve hosts based only on their own load.
    """
    # Should we clear?
    # self.reserved_hosts.clear()

    loads: List[List[int | float]] = []
    for hid in self.reserved_hosts:
      host = self.hosts[hid]
      load = self._host_load(host, now)
      loads.append([hid, load])
    loads.sort(key=lambda x: x[1])

    if loads[0][1] >= self.load_threshold:
      if len(self.reserved_hosts) < len(self.hosts):
        self.reserved_hosts.add(self.fastest[len(self.reserved_hosts)].host_id)
        self.reserve_count = self.reserve_count + 1
    elif loads[0][1] <= 0.1:
      pass  # remove a reserved host

  # -------------------------------------------------

  def _tail_risk(self, host: Host, incoming: Task) -> float:
    """
    Compute max tail probability that existing tasks on host
    exceed incoming hard task deadline.
    """
    x = incoming.deadline

    task_types = [incoming.task_type]

    if host.current_task:
      task_types.append(host.current_task.task_type)

    for q in host.queue:
      task_types.append(q.task_type)

    return conv_tail_probability(task_types, x)
  # -------------------------------------------------

  def select_host(
      self,
      task: Task,
      hosts: List[Host],
      now: float
  ) -> Optional[int]:

    self._update_reserves(now)

    # -------------------------
    # Soft tasks: ignore reservation
    # -------------------------
    if not task.is_hard:
      return min(hosts, key=lambda h: len(h.queue) + 1 if h.current_task is not None else 0).host_id

    # -------------------------
    # Hard tasks: tail-aware logic
    # -------------------------
    candidates = []

    for h in hosts:
      risk = self._tail_risk(h, task)
      if risk < self.tail_threshold:
        candidates.append(h)

    if not candidates and self.reserved_hosts:
      # Send to least-loaded reserved host
      candidates = [
          h for h in hosts if h.host_id in self.reserved_hosts
      ]
    if candidates:
      return min(
          candidates,
          key=lambda h: len(h.queue) + 1 if h.current_task is not None else 0
      ).host_id

    # Otherwise: shortest queue globally
    return min(hosts, key=lambda h: len(h.queue) + 1 if h.current_task is not None else 0).host_id
