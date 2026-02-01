from dataclasses import dataclass, field
from typing import List
import random


@dataclass
class TaskType:
  id: str
  samples: List[float]

  mean: float = field(init=False)
  max: float = field(init=False)
  variance: float = field(init=False)

  def __post_init__(self):
    self.mean = sum(self.samples) / len(self.samples)
    self.max = max(self.samples)
    print("Task type", self.id, self.mean, self.max)
    m = self.mean
    self.variance = sum((x - m) ** 2 for x in self.samples) / len(self.samples)
    self._sorted_samples = sorted(self.samples)

  def sample_execution_time(self, rng: random.Random) -> float:
    return rng.choice(self.samples)
