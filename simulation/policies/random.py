from random import choice

from policies.base import SchedulingPolicy


class Random(SchedulingPolicy):

  def select_host(self, task, hosts, now):
    return choice(hosts).host_id
