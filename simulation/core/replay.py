import json
from typing import List
from core.task import Task
from core.task_type import TaskType

class ReplayTaskLoader:
    """
    Loads tasks from trace.
    Execution time and arrival time are fixed.
    Host assignment is ignored.
    """

    def __init__(self, trace_path: str, task_types: List[TaskType]):
        self.task_type_map = {tt.id: tt for tt in task_types}
        self.trace_path = trace_path

    def load(self) -> List[Task]:
        tasks = []

        with open(self.trace_path, "r") as f:
            for line in f:
                rec = json.loads(line)
                tt = self.task_type_map[rec["task_type"]]

                task = Task(
                    task_id=rec["task_id"],
                    arrival_time=rec["arrival_time"],
                    task_type=tt,
                    is_hard=rec["is_hard"],
                    deadline=rec["deadline"],
                )

                # Fixed execution time
                task.execution_time = rec["execution_time"]

                tasks.append(task)

        return tasks
