def generate_report(rejected, tasks):
  hard_miss = 0
  soft_miss = 0
  lateness = []

  for t in tasks:
    if t.finish_time is None or t.finish_time > t.deadline or t.dropped:
      if t.is_hard:
        hard_miss += 1
      else:
        soft_miss += 1
    if t.finish_time is not None:
      lateness.append(t.finish_time - t.deadline)

  lateness.sort()

  def q(p):
    if not lateness:
      return None
    return lateness[int(p * (len(lateness) - 1))]

  return {
      "total": len(tasks),
      "rejected": rejected,
      "hard_deadline_miss": hard_miss,
      "soft_deadline_miss": soft_miss,
      "lateness_mean": sum(lateness) / len(lateness) if lateness else 0,
      # "lateness_p99": q(0.99),
      "lateness_max": max(lateness) if lateness else 0,
  }
