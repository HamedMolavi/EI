#!/usr/bin/env python3
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# ---------------- CONFIG ----------------

BASE = Path("/EI")
RESULTS = BASE / "reports"
COLUMN = "elapsed_wall_ms"
MAX_TAIL_FRAC = 0.2     # use top 20% at most
MIN_TAIL_FRAC = 0.02    # use at least top 2%

# ---------------------------------------


def hill_estimator(x, k):
  """
  Hill estimator for tail index alpha.
  """
  x = np.sort(x)
  x_tail = x[-k:]
  x_k = x[-k - 1]
  return k / np.sum(np.log(x_tail / x_k))


def mean_excess(x, thresholds):
  """
  Mean excess function e(u) = E[X - u | X > u]
  """
  me = []
  for u in thresholds:
    excess = x[x > u] - u
    me.append(np.mean(excess) if len(excess) > 0 else np.nan)
  return np.array(me)


def main(csv_path):
  out_img = str(csv_path).replace(".csv", "_tail.png")

  df = pd.read_csv(csv_path)
  if COLUMN not in df.columns:
    raise ValueError(f"Column '{COLUMN}' not found")

  x = df[COLUMN].dropna().values
  n = len(x)

  if n < 200:
    raise ValueError("Need at least ~200 samples for tail analysis")

  x = np.sort(x)

  # ---------------- CCDF ----------------

  ccdf = 1.0 - np.arange(1, n + 1) / n

  # ---------------- HILL ESTIMATOR ----------------

  k_min = int(MIN_TAIL_FRAC * n)
  k_max = int(MAX_TAIL_FRAC * n)
  ks = np.arange(k_min, k_max)

  hill_vals = np.array([hill_estimator(x, k) for k in ks])

  # Stability check
  hill_std = np.nanstd(hill_vals)
  hill_mean = np.nanmean(hill_vals)

  # ---------------- MEAN EXCESS ----------------

  thresholds = np.quantile(x, np.linspace(0.7, 0.95, 30))
  me_vals = mean_excess(x, thresholds)

  # ---------------- PLOTS ----------------

  fig, axes = plt.subplots(2, 2, figsize=(18, 10))
  fig.suptitle(f"Tail Analysis: {csv_path.name}", fontsize=14)

  # CCDF (semi-log)
  ax = axes[0, 0]
  ax.semilogy(x, ccdf)
  ax.set_title("CCDF (semi log)")
  ax.set_xlabel(COLUMN)
  ax.set_ylabel("P(X > x)")

  # CCDF (log-log)
  ax = axes[0, 1]
  ax.loglog(x, ccdf)
  ax.set_title("CCDF (log-log)")
  ax.set_xlabel(COLUMN)
  ax.set_ylabel("P(X > x)")

  # Hill plot
  ax = axes[1, 0]
  ax.plot(ks, hill_vals)
  ax.set_title("Hill Estimator")
  ax.set_xlabel("k (tail size)")
  ax.set_ylabel("alpha (tail index)")

  # Mean excess
  ax = axes[1, 1]
  ax.plot(thresholds, me_vals)
  ax.set_title("Mean Excess Plot")
  ax.set_xlabel("Threshold u")
  ax.set_ylabel("E[X − u | X > u]")

  plt.tight_layout()
  plt.savefig(out_img, dpi=160)
  plt.close()

  # ---------------- DIAGNOSIS ----------------

  verdicts = []

  # Hill test
  if hill_mean < 10 and hill_std < hill_mean:
    verdicts.append("heavy")
  else:
    verdicts.append("light")

  # Mean excess trend
  slope = np.polyfit(thresholds[~np.isnan(me_vals)],
                     me_vals[~np.isnan(me_vals)], 1)[0]
  if slope > 0:
    verdicts.append("heavy")
  else:
    verdicts.append("light")

  # ---- CCDF slope inspection (robust) ----
  tail_x = x[-k_max:]
  tail_ccdf = ccdf[-k_max:]

  # Remove zero or negative CCDF values
  mask = tail_ccdf > 0
  tail_x = tail_x[mask]
  tail_ccdf = tail_ccdf[mask]

  logccdf = np.log(tail_ccdf)
  if len(tail_x) > 10:
    logx = np.log(tail_x)
    r_loglog = np.corrcoef(logx, logccdf)[0, 1]
  else:
    r_loglog = np.nan
  if len(tail_x) > 10:
    r_semilog = np.corrcoef(tail_x, logccdf)[0, 1]
  else:
    r_semilog = np.nan
  if r_loglog < -0.95:
    verdicts.append("heavy")
  else:
    verdicts.append("light")

  heavy_votes = verdicts.count("heavy")

  if heavy_votes >= 2:
    final = "LIKELY HEAVY-TAILED"
  elif heavy_votes == 1:
    final = "BORDERLINE"
  else:
    final = "LIKELY LIGHT-TAILED"

  # ---------------- REPORT ----------------

  print("========== Tail Analysis Report ==========")
  print(f"Samples              : {n}")
  print(f"Hill alpha (mean)    : {hill_mean:.3f}")
  print(f"Hill alpha (std)     : {hill_std:.3f}")
  print(f"Mean excess slope    : {slope:.3f}")
  print(f"CCDF log–log corr    : {r_loglog:.3f}")
  print(f"CCDF semi–log corr   : {r_semilog:.3f}")
  print("------------------------------------------")
  print(f"FINAL VERDICT        : {final}")
  print("------------------------------------------")
  print(f"Saved figure to      : {out_img}")


if __name__ == "__main__":
  if len(sys.argv) != 2:
    print("Usage: python3 tail_analysis.py <results.csv>")
    sys.exit(1)

  main(RESULTS / sys.argv[1])
