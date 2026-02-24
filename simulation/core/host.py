from dataclasses import dataclass, field
from typing import List, Optional
from core.task import Task


@dataclass
class Host:
  host_id: int
  speed: float

  queue: List[Task] = field(default_factory=list)
  current_task: Optional[Task] = None
  busy_until: float = 0.0

  def is_idle(self, now: float) -> bool:
    return self.current_task is None or now >= self.busy_until

  def load(self, now: float) -> float:
    """
    Load estimate for a single host.
    """
    work = 0.0

    if self.current_task:
      work += max(0.0, self.busy_until - now)

    for q in self.queue:
      work += q.task_type.mean / self.speed

    return work
