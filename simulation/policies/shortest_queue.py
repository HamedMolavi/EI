from policies.base import SchedulingPolicy


class ShortestQueuePolicy(SchedulingPolicy):

  def select_host(self, task, hosts, now):
    return min(hosts, key=lambda h: len(h.queue) + 1 if h.current_task is not None else 0).host_id
