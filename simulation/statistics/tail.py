from typing import List
from core.task_type import TaskType

def conv_tail_probability(task_types: List[TaskType], x: float):
  probs = []

  for task_type in task_types:
    probs.append(
        task_type.tail_probability( x)
    )

  out = 1
  for prob in probs:
    out = out * prob
  return out
