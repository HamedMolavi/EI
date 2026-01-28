from policies.base import SchedulingPolicy


class ShortestQueuePolicy(SchedulingPolicy):

  def select_host(self, task, hosts, now):
    # feasible_hosts = []

    # for h in hosts:
    #   # Estimate remaining work on host h
    #   work = 0.0

    #   # Current running task
    #   if h.current_task is not None:
    #     remaining = max(h.current_task.task_type.max,
    #                     h.current_task.start_time + h.current_task.task_type.mean - now)
    #     work += remaining

    #   # Queued tasks (mean-based estimate)
    #   for q in h.queue:
    #     work += q.task_type.mean / h.speed

    #   # Feasibility check
    #   if now + work <= task.deadline:
    #     feasible_hosts.append(h)

    # if not feasible_hosts:
    #   return None  # reject task

    # Among feasible hosts, choose shortest queue
    # return min(feasible_hosts, key=lambda h: len(h.queue)).host_id
    return min(hosts, key=lambda h: len(h.queue) + 1 if h.current_task is not None else 0).host_id
