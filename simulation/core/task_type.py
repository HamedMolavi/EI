from bisect import bisect_right
from dataclasses import dataclass, field
from typing import List
import random

from core.host import Host


@dataclass
class TaskType:
  id: str
  samples: List[float]

  mean: float = field(init=False)
  max: float = field(init=False)
  variance: float = field(init=False)
  arrival_rate: float = field(init=False)
  deadline: float = field(init=False)
  baseline_deadline_miss_probability: float = field(init=False)

  def __init__(self, hosts: List[Host]) -> None:
    self.total_hosts_speed = sum(map(lambda h: h.speed, hosts))

  def __post_init__(self):
    self.mean = sum(self.samples) / len(self.samples)
    self.max = max(self.samples)
    self.deadline = 1.5 * self.mean
    self.baseline_deadline_miss_probability = self.tail_probability(
      self.deadline)
    self.arrival_rate = 0.5 * self.total_hosts_speed / self.mean
    print("Task type", self.id, self.mean, self.max)
    m = self.mean
    self.variance = sum((x - m) ** 2 for x in self.samples) / len(self.samples)
    self._sorted_samples = sorted(self.samples)

  def sample_execution_time(self, rng: random.Random) -> float:
    return rng.choice(self.samples)

  def tail_probability(self, x: float) -> float:
    """
    Empirical P(S > x) for a given task type.

    Uses sorted samples + binary search.
    O(log n) per call.
    No copying.
    Deterministic
    """
    samples = self.samples

    # Defensive: empty samples should never happen
    if not samples:
      return 0.0

    sorted_samples: List[float] = self._sorted_samples

    idx = bisect_right(sorted_samples, x)
    return (len(sorted_samples) - idx) / len(sorted_samples)
