#!/usr/bin/env python3
from pathlib import Path
import sys
import numpy as np
import pandas as pd

# ---------------- CONFIG ----------------

BASE = Path("/EI")
RESULTS = BASE / "reports"
COLUMN = "elapsed_wall_ms"
DOMINANCE_LIMIT = 0.40      # 20%
T_START = 1e-4
T_STEP = 1e-3
T_MAX_HARD = 10.0           # absolute safety cap
PERCENTILES = [99, 99.5, 99.9]

# ---------------------------------------


def empirical_mgf(x, t):
  ex = np.exp(t * x)
  return np.mean(ex), ex


def find_theta_max(x):
  """
  Increase t until dominance or overflow.
  """
  t = T_START
  last_good_t = t

  while t < T_MAX_HARD:
    try:
      mgf, ex = empirical_mgf(x, t)
      contrib = np.max(ex) / np.sum(ex)

      if not np.isfinite(mgf):
        break

      if contrib > DOMINANCE_LIMIT:
        break

      last_good_t = t
      t += T_STEP

    except FloatingPointError:
      break

  return last_good_t


def log_mgf(x, t):
  mgf, _ = empirical_mgf(x, t)
  return np.log(mgf)


def chernoff_exponent(x, theta_grid):
  psi = np.array([log_mgf(x, t) for t in theta_grid])
  return psi


def main(csv_path):
  df = pd.read_csv(csv_path)
  x = df[COLUMN].dropna().values

  if len(x) < 1000:
    raise ValueError("Need sufficient samples")

  x = np.sort(x)

  # ---------------- θ_max ----------------

  theta_max = find_theta_max(x)
  theta_grid = np.linspace(T_START, theta_max, 400)

  print("========== Chernoff Analysis ==========")
  print(f"Samples             : {len(x)}")
  print(f"θ_max (stable)      : {theta_max:.4f}")
  print("")

  # ---------------- ψ(θ) ----------------

  psi_vals = chernoff_exponent(x, theta_grid)

  # ---------------- Percentiles ----------------

  for p in PERCENTILES:
    xp = np.percentile(x, p)
    emp_prob = 1.0 - p / 100.0

    # Chernoff optimization
    values = psi_vals - theta_grid * xp
    idx = np.argmin(values)

    theta_star = theta_grid[idx]
    bound = np.exp(values[idx])

    # Diagnostics
    ratio = theta_star / theta_max

    print(f"--- p{p} ---")
    print(f"x_p                 : {xp:.4f}")
    print(f"Empirical P[X≥x]    : {emp_prob:.4f}")
    print(f"Chernoff bound      : {bound:.4f}")
    print(f"θ*                  : {theta_star:.4f}")
    print(f"θ*/θ_max            : {ratio:.3f}")

    if ratio < 0.7:
      print("θ* well inside valid range")
    else:
      print("WARN: θ* near stability limit")

    print("")

  # ---------------- Slope comparison ----------------

  tail = x[int(0.95 * len(x)):]
  ccdf = 1.0 - np.arange(len(tail)) / len(x)

  # Empirical slope
  log_ccdf = np.log(ccdf[ccdf > 0])
  tail_x = tail[:len(log_ccdf)]
  emp_slope = np.polyfit(tail_x, log_ccdf, 1)[0]

  # Chernoff slope (asymptotic)
  asymp_theta = theta_grid[np.argmax(theta_grid)]
  cher_slope = -asymp_theta

  print("---------- Asymptotic Check ----------")
  print(f"Empirical tail slope : {emp_slope:.4f}")
  print(f"Chernoff exponent    : {cher_slope:.4f}")
  if np.isclose(emp_slope, cher_slope, rtol=0.3):
    print("Slope match")
  else:
    print("WARN: Slope mismatch")
  print("-------------------------------------")




if __name__ == "__main__":
  if len(sys.argv) != 2:
    print("Usage: python3 chernoff_analysis.py <results.csv>")
    sys.exit(1)

  main(RESULTS / sys.argv[1])
