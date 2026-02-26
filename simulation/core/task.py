from dataclasses import dataclass
from typing import Optional
from core.task_type import TaskType

@dataclass
class Task:
    task_id: int
    arrival_time: float
    task_type: TaskType
    is_hard: bool
    deadline_time: float

    execution_time: Optional[float] = None
    assigned_host: Optional[int] = None
    start_time: Optional[float] = None
    finish_time: Optional[float] = None
    dropped: bool = False

    def lateness(self):
        if self.finish_time is None:
            return None
        return self.finish_time - self.deadline_time
