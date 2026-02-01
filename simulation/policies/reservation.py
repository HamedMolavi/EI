from typing import List, Set, Optional
from policies.base import SchedulingPolicy
from core.host import Host
from core.task import Task


class ReservationPolicy(SchedulingPolicy):
    """
    Policy with an internal host reservation mechanism.
    """

    def __init__(
        self,
        hosts: List[Host],
        reserve_count: int = 1,
        load_threshold: float = 0.8
    ):
        """
        :param hosts: full host list (passed once at init)
        :param reserve_count: number of hosts to reserve
        :param load_threshold: utilization threshold to activate reservation
        """
        self.all_hosts = hosts
        self.reserve_count = reserve_count
        self.load_threshold = load_threshold

        self.reserved_hosts: Set[int] = set()
        self._initialize_reserves()

    # -----------------------------

    def _initialize_reserves(self):
        """
        Initial static reservation.
        Default: reserve fastest hosts.
        """
        fastest = sorted(
            self.all_hosts,
            key=lambda h: h.speed,
            reverse=True
        )
        self.reserved_hosts = {
            h.host_id for h in fastest[: self.reserve_count]
        }

    # -----------------------------

    def _system_load(self) -> float:
        """
        Estimate system load using mean service times.
        """
        total_work = 0.0
        total_capacity = sum(h.speed for h in self.all_hosts)

        for h in self.all_hosts:
            if h.current_task:
                total_work += max(0.0, h.busy_until)
            for q in h.queue:
                total_work += q.task_type.mean

        return total_work / total_capacity if total_capacity > 0 else 0.0

    # -----------------------------

    def _update_reserves(self, now: float):
        """
        Dynamically update reserve list if needed.
        """
        load = self._system_load()

        if load >= self.load_threshold:
            # Activate reservation
            fastest = sorted(
                self.all_hosts,
                key=lambda h: h.speed,
                reverse=True
            )
            self.reserved_hosts = {
                h.host_id for h in fastest[: self.reserve_count]
            }
        else:
            # Release reservations
            self.reserved_hosts.clear()

    # -----------------------------

    def select_host(
        self,
        task: Task,
        hosts: List[Host],
        now: float
    ) -> Optional[int]:

        # Update internal reserve list on every decision
        self._update_reserves(now)

        # Candidate hosts: exclude reserved ones
        candidates = [
            h for h in hosts if h.host_id not in self.reserved_hosts
        ]

        if not candidates:
            return None

        # Example selection: shortest queue among candidates
        return min(candidates, key=lambda h: len(h.queue) + 1 if h.current_task is not None else 0).host_id
