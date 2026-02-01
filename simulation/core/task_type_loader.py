import csv
from typing import List
from core.task_type import TaskType

def load_task_types(
    task_type_ids: List[str],
    base_path: str = "/EI/reports"
) -> List[TaskType]:
    task_types = []

    for tid in task_type_ids:
        path = f"{base_path}/{tid}_1.0_cpu_results.csv"
        samples = []

        with open(path, "r") as f:
            reader = csv.DictReader(f)
            # if "elapsed_wall_ms" not in reader.fieldnames:
            #     raise ValueError(
            #         f"'elapsed_wall_ms' column not found in {path}"
            #     )

            for row in reader:
                try:
                    samples.append(float(row["elapsed_wall_ms"]))
                except ValueError:
                    continue  # skip malformed rows

        if not samples:
            raise ValueError(f"No valid samples loaded from {path}")

        task_types.append(TaskType(tid, samples))

    return task_types
