from bisect import bisect_right
from typing import List
from core.task_type import TaskType


def tail_probability(task_type: TaskType, x: float) -> float:
    """
    Empirical P(S > x) for a given task type.

    Uses sorted samples + binary search.
    O(log n) per call.
    No copying.
    Deterministic
    """
    samples = task_type.samples

    # Defensive: empty samples should never happen
    if not samples:
        return 0.0

    sorted_samples: List[float] = task_type._sorted_samples

    idx = bisect_right(sorted_samples, x)
    return (len(sorted_samples) - idx) / len(sorted_samples)
