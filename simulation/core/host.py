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
