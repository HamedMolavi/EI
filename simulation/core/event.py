from dataclasses import dataclass, field
from typing import Any

EVENT_FINISH = 0
EVENT_ARRIVAL = 1
EVENT_START = 2

@dataclass(order=True)
class Event:
    time: float
    kind: int
    payload: Any = field(compare=False)
