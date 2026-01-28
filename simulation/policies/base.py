from abc import ABC, abstractmethod
from typing import List, Optional
from core.task import Task
from core.host import Host

class SchedulingPolicy(ABC):

    @abstractmethod
    def select_host(
        self,
        task: Task,
        hosts: List[Host],
        now: float
    ) -> Optional[int]:
        pass
