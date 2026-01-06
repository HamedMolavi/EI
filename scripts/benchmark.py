#!/usr/bin/env python3
import os
import csv
import random
import subprocess
import time
import zipfile
import tempfile
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# ---------------- CONFIG ----------------


def load_env(path):
  env = {}
  with open(path) as f:
    for line in f:
      line = line.strip()
      if not line or line.startswith("#"):
        continue
      key, value = line.split("=", 1)
      env[key.strip()] = value.strip()
  return env


BASE = Path("/EI")
ENV_PATH = BASE / "scripts" / "benchmark.env"
ENV = load_env(ENV_PATH)

CPU_FRACTIONS = [float(x) for x in ENV["CPU_FRACTIONS"].split(",")]
PERIOD = int(ENV["PERIOD"])
CONCURRENCY = int(ENV["CONCURRENCY"])
TASKS = int(ENV["TASKS"])
WORKER = ENV["WORKER"]

DATA_DIR = BASE / "data"
IMG_ZIP = DATA_DIR / "images.zip"

SCRIPTS_DIR = BASE / "scripts"
WORKER_PATH = SCRIPTS_DIR / (WORKER + ".py")

RESULTS = BASE / "reports"
RESULTS.mkdir(parents=True, exist_ok=True)

CGROUP = "imgbench"
CGROUP_ROOT = "/sys/fs/cgroup"

# ---------------- ZIP SETUP ----------------

ZIP = zipfile.ZipFile(IMG_ZIP, "r")
ZIP_IMAGE_LIST = [
    name for name in ZIP.namelist()
    if name.lower().endswith(".jpg") or name.lower().endswith(".jpeg")
]

# ---------------- CGROUP ----------------


def create_cgroup(name, cpu_fraction):
  path = Path(CGROUP_ROOT) / name
  path.mkdir(exist_ok=True)
  quota = "max" if cpu_fraction >= 1 else f"{int(cpu_fraction * PERIOD)} {PERIOD}"
  (path / "cpu.max").write_text(quota)
  return path


def delete_cgroup(path):
  try:
    path.rmdir()
  except Exception:
    pass


def add_self_to_cgroup(cgroup_path):
  (cgroup_path / "cgroup.procs").write_text(str(os.getpid()))

# ---------------- IMAGE PICKING ----------------


def pick_image():
  member = random.choice(ZIP_IMAGE_LIST)

  tmp = tempfile.NamedTemporaryFile(
      suffix=".jpg",
      delete=False
  )

  with ZIP.open(member) as src:
    tmp.write(src.read())

  tmp.close()
  return Path(tmp.name), True

# ---------------- TASK ----------------


def run_one(cgroup_path):
  img_path, is_temp = pick_image()

  start = time.monotonic_ns()
  proc = subprocess.Popen(
      ["python3", WORKER_PATH, str(img_path)],
      preexec_fn=lambda: add_self_to_cgroup(cgroup_path)
  )

  pid, _, rusage = os.wait4(proc.pid, 0)
  end = time.monotonic_ns()
  if is_temp:
    img_path.unlink(missing_ok=True)

  return {
      "elapsed_wall_ms": round((end - start) / 1e6, 3),
      "cpu_user_sec": round(rusage.ru_utime * 1000, 3),
      "cpu_sys_sec": round(rusage.ru_stime * 1000, 3),
      "cpu_total_sec": round((rusage.ru_utime + rusage.ru_stime) * 1000, 3),
      "source": "zip",
  }

# ---------------- MAIN ----------------


def main():
  try:
    for cpu_fraction in CPU_FRACTIONS:
      cgroup = create_cgroup(CGROUP, cpu_fraction)

      out_csv = RESULTS / f"{WORKER}_{cpu_fraction}_cpu_results.csv"
      with open(out_csv, "w", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["elapsed_wall_ms", "cpu_user_sec", "cpu_sys_sec",
                        "cpu_total_sec", "source"]
        )
        writer.writeheader()

        with ThreadPoolExecutor(max_workers=CONCURRENCY) as pool:
          futures = [pool.submit(run_one, cgroup) for _ in range(TASKS)]
          for fut in as_completed(futures):
            writer.writerow(fut.result())

  except KeyboardInterrupt:
    pass
  delete_cgroup(cgroup)


if __name__ == "__main__":
  main()
