#!/usr/bin/env python3
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import gaussian_kde, skew, kurtosis

# ---------------- CONFIG ----------------

COLUMN = "elapsed_wall_ms"   # change if needed
BINS = 100

# ---------------------------------------


def main(csv_path):
    csv_path = Path(csv_path)
    out_img = csv_path.with_suffix(".png")

    df = pd.read_csv(csv_path)

    if COLUMN not in df.columns:
        raise ValueError(f"Column '{COLUMN}' not found in CSV")

    x = df[COLUMN].dropna().values

    if len(x) == 0:
        raise ValueError("No data points to analyze")

    # ---------------- STATISTICS ----------------

    stats = {
        "count": len(x),
        "mean": np.mean(x),
        "median": np.median(x),
        "variance": np.var(x, ddof=1),
        "std": np.std(x, ddof=1),
        "min": np.min(x),
        "max": np.max(x),
        "p50": np.percentile(x, 50),
        "p90": np.percentile(x, 90),
        "p95": np.percentile(x, 95),
        "p99": np.percentile(x, 99),
        "p999": np.percentile(x, 99.9),
        "iqr": np.percentile(x, 75) - np.percentile(x, 25),
        "skewness": skew(x),
        "kurtosis": kurtosis(x, fisher=False),
    }

    # ---------------- PLOTS ----------------

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle(f"Statistical Analysis: {csv_path.name}", fontsize=14)

    # ---- PDF ----
    ax = axes[0, 0]
    ax.hist(x, bins=BINS, density=True, alpha=0.6, label="Histogram")

    try:
        kde = gaussian_kde(x)
        xs = np.linspace(x.min(), x.max(), 1000)
        ax.plot(xs, kde(xs), label="KDE")
    except Exception:
        pass

    ax.set_title("PDF")
    ax.set_xlabel(COLUMN)
    ax.set_ylabel("Density")
    ax.legend()

    # ---- CDF ----
    ax = axes[0, 1]
    xs = np.sort(x)
    cdf = np.arange(1, len(xs) + 1) / len(xs)
    ax.plot(xs, cdf)
    ax.set_title("CDF")
    ax.set_xlabel(COLUMN)
    ax.set_ylabel("P(X ≤ x)")

    # ---- CCDF ----
    ax = axes[1, 0]
    ccdf = 1.0 - cdf
    ax.plot(xs, ccdf)
    ax.set_yscale("log")
    ax.set_title("CCDF (log scale)")
    ax.set_xlabel(COLUMN)
    ax.set_ylabel("P(X > x)")

    # ---- Boxplot ----
    ax = axes[1, 1]
    ax.boxplot(x, vert=False, showfliers=True)
    ax.set_title("Boxplot")
    ax.set_xlabel(COLUMN)

    # ---------------- STATS TEXT ----------------

    text = "\n".join([
        f"Count     : {stats['count']}",
        f"Mean      : {stats['mean']:.3f}",
        f"Median    : {stats['median']:.3f}",
        f"Std       : {stats['std']:.3f}",
        f"Variance  : {stats['variance']:.3f}",
        f"Min / Max : {stats['min']:.3f} / {stats['max']:.3f}",
        f"P90       : {stats['p90']:.3f}",
        f"P95       : {stats['p95']:.3f}",
        f"P99       : {stats['p99']:.3f}",
        f"P99.9     : {stats['p999']:.3f}",
        f"IQR       : {stats['iqr']:.3f}",
        f"Skewness  : {stats['skewness']:.3f}",
        f"Kurtosis  : {stats['kurtosis']:.3f}",
    ])

    fig.text(0.02, 0.02, text, fontsize=10, family="monospace")

    plt.tight_layout(rect=[0, 0.05, 1, 0.95])
    plt.savefig(out_img, dpi=150)
    plt.close()

    print(f"Saved analysis to {out_img}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 analyze_report.py <report.csv>")
        sys.exit(1)

    main(sys.argv[1])
