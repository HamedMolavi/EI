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
import time
import psutil

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
ENV_PATH = BASE / "scripts" / ".env"
ENV = load_env(ENV_PATH)

# maximum runnable time per period
CPU_FRACTIONS = [float(x) for x in ENV["CPU_FRACTIONS"].split(",")]
PERIOD = int(ENV["PERIOD"])   # micro seconds
CONCURRENCY = int(ENV["CONCURRENCY"])
TASKS = int(ENV["TASKS"])
WORKER = ENV["WORKER"]
IS_WARM = "warm" in WORKER.lower()

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


def run_one_cold(cgroup_path):
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
      "cpu_user_ms": round(rusage.ru_utime * 1000, 3),
      "cpu_sys_ms": round(rusage.ru_stime * 1000, 3),
      "cpu_total_ms": round((rusage.ru_utime + rusage.ru_stime) * 1000, 3),
      "mode": "cold",
      "source": "zip",
  }


def run_warm_loop(cgroup_path):
  """
  Starts ONE persistent worker process and returns a callable
  that executes ONE warm request and measures:
    - wall time
    - CPU time delta
  """
  proc = subprocess.Popen(
      ["python3", WORKER_PATH],
      stdin=subprocess.PIPE,
      stdout=subprocess.PIPE,
      text=True,
      preexec_fn=lambda: add_self_to_cgroup(cgroup_path),
      bufsize=1,
  )

  ps = psutil.Process(proc.pid)

  def run_one_warm():
    img_path, is_temp = pick_image()

    # CPU snapshot BEFORE request
    cpu_before = ps.cpu_times()
    start = time.monotonic_ns()

    proc.stdin.write(str(img_path) + "\n")
    proc.stdin.flush()
    proc.stdout.readline()   # wait for ACK

    end = time.monotonic_ns()
    cpu_after = ps.cpu_times()

    if is_temp:
      img_path.unlink(missing_ok=True)

    return {
        "elapsed_wall_ms": round((end - start) / 1e6, 3),
        "cpu_user_ms": round((cpu_after.user - cpu_before.user) * 1000, 3),
        "cpu_sys_ms": round((cpu_after.system - cpu_before.system) * 1000, 3),
        "cpu_total_ms": round(
            ((cpu_after.user - cpu_before.user) +
             (cpu_after.system - cpu_before.system)) * 1000, 3
        ),
        "mode": "warm",
        "source": "zip",
    }

  return proc, run_one_warm


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
                        "cpu_total_sec", "mode", "source"]
        )
        writer.writeheader()

        if IS_WARM:
            # ---- WARM START MODE ----
          proc, run_one = run_warm_loop(cgroup)

          with ThreadPoolExecutor(max_workers=CONCURRENCY) as pool:
            futures = [pool.submit(run_one) for _ in range(TASKS)]
            for fut in as_completed(futures):
              writer.writerow(fut.result())

          # clean shutdown
          proc.stdin.write("__EXIT__\n")
          proc.stdin.flush()
          proc.wait()

        else:
          # ---- COLD START MODE ----
          with ThreadPoolExecutor(max_workers=CONCURRENCY) as pool:
            futures = [pool.submit(run_one_cold, cgroup) for _ in range(TASKS)]
            for fut in as_completed(futures):
              writer.writerow(fut.result())

  except KeyboardInterrupt:
    pass
  delete_cgroup(cgroup)


if __name__ == "__main__":
  main()
