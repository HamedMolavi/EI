#!/usr/bin/env python3
import os
import csv
import random
import subprocess
import time
from typing import List
import zipfile
import tempfile
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
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

CPU_FRACTIONS = [float(x) for x in ENV["CPU_FRACTIONS"].split(",")]
PERIOD = int(ENV["PERIOD"])
CONCURRENCY = int(ENV["CONCURRENCY"])
TASKS = int(ENV["TASKS"])

WORKER = ENV["WORKER"]
IS_WARM = "warm" in WORKER.lower()
IS_BATCH = "batch" in WORKER.lower()
N_MIN = int(ENV["N_MIN"])
N_MAX = int(ENV["N_MAX"])

DATA_DIR = BASE / "data"
IMG_ZIP = DATA_DIR / "images.zip"

SCRIPTS_DIR = BASE / "scripts"
WORKER_PATH = SCRIPTS_DIR / (WORKER + ".py")

RESULTS = BASE / "reports"
RESULTS.mkdir(parents=True, exist_ok=True)

CGROUP = "imgbench"
CGROUP_ROOT = "/sys/fs/cgroup"

# ---------------- Report writer ----------------


def create_writer(fieldnames: List[str], cpu_fraction: float = 1.0):
  out_csv = RESULTS / f"{WORKER}_{cpu_fraction}_cpu_results.csv"
  file_exists = out_csv.exists()
  # open in append mode
  f = open(out_csv, "a", newline="")
  writer = csv.DictWriter(f, fieldnames=fieldnames)
  # write header only if file did not exist or was empty
  if not file_exists or out_csv.stat().st_size == 0:
    writer.writeheader()
  return f, writer


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

  tmp = tempfile.NamedTemporaryFile(
      suffix=".jpg",
      delete=False
  )

  with zipfile.ZipFile(IMG_ZIP, "r") as z:
    ZIP_IMAGE_LIST = [
        name for name in z.namelist()
        if name.lower().endswith(".jpg") or name.lower().endswith(".jpeg")
    ]
    member = random.choice(ZIP_IMAGE_LIST)
    with z.open(member) as src:
      tmp.write(src.read())

  tmp.close()
  return Path(tmp.name), True

# ---------------- COLD MODE ----------------


def run_one_cold(cgroup_path):
  img_path, is_temp = pick_image()

  print(f"running {img_path} on {WORKER}...")
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

# ---------------- WARM POOL MODE ----------------


def start_warm_pool(cgroup_path, size):
  workers = []

  for _ in range(size):
    proc = subprocess.Popen(
        ["python3", WORKER_PATH],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True,
        bufsize=1,
        preexec_fn=lambda: add_self_to_cgroup(cgroup_path),
    )

    workers.append({
        "proc": proc,
        "ps": psutil.Process(proc.pid)
    })

  return workers


def run_N_sequentials_on_parallel_poll(workers):
  results = []
  batch = []

  for w in workers:
    n = random.randint(N_MIN, N_MAX)

    img_paths = []
    for _ in range(n):
      img_path, is_temp = pick_image()
      img_paths.append((img_path, is_temp))
    batch.append((w, img_paths))
    print("\ttask:", len(img_paths))

  cpu_before = {}
  start_times = {}

  # Send batch requests
  for w, img_paths in batch:
    pid = w["proc"].pid
    cpu_before[pid] = w["ps"].cpu_times()
    start_times[pid] = time.monotonic_ns()

    line = " ".join(str(p) for p, _ in img_paths)
    w["proc"].stdin.write(line + "\n")
    w["proc"].stdin.flush()

  # Wait for completion
  for w, img_paths in batch:
    w["proc"].stdout.readline()
    end = time.monotonic_ns()

    pid = w["proc"].pid
    cpu_after = w["ps"].cpu_times()

    elapsed = (end - start_times[pid]) / 1e6
    cpu_user = (cpu_after.user - cpu_before[pid].user) * 1000
    cpu_sys = (cpu_after.system - cpu_before[pid].system) * 1000

    # Cleanup temp files
    for img_path, is_temp in img_paths:
      if is_temp:
        img_path.unlink(missing_ok=True)

    results.append({
        "elapsed_wall_ms": round(elapsed, 3),
        "cpu_user_ms": round(cpu_user, 3),
        "cpu_sys_ms": round(cpu_sys, 3),
        "cpu_total_ms": round(cpu_user + cpu_sys, 3),
        "batch_size": len(img_paths),
        "mode": "warm_batch",
        "source": "zip",
    })

  return results


def run_parallel_pool(workers):
  results = []
  batch = []

  # Prepare batch
  for w in workers:
    img_path, is_temp = pick_image()
    print(img_path, img_path.exists())
    batch.append((w, img_path, is_temp))

  cpu_before = {}
  start_times = {}

  # Send requests in parallel
  for w, img_path, _ in batch:
    pid = w["proc"].pid
    cpu_before[pid] = w["ps"].cpu_times()
    start_times[pid] = time.monotonic_ns()

    w["proc"].stdin.write(str(img_path) + "\n")
    w["proc"].stdin.flush()

  # Wait for all
  for w, img_path, is_temp in batch:
    w["proc"].stdout.readline()
    end = time.monotonic_ns()

    pid = w["proc"].pid
    cpu_after = w["ps"].cpu_times()

    elapsed = (end - start_times[pid]) / 1e6
    cpu_user = (cpu_after.user - cpu_before[pid].user) * 1000
    cpu_sys = (cpu_after.system - cpu_before[pid].system) * 1000

    results.append({
        "elapsed_wall_ms": round(elapsed, 3),
        "cpu_user_ms": round(cpu_user, 3),
        "cpu_sys_ms": round(cpu_sys, 3),
        "cpu_total_ms": round(cpu_user + cpu_sys, 3),
        "mode": "warm",
        "source": "zip",
    })

  return results

# ---------------- MAIN ----------------


def main():
  for cpu_fraction in CPU_FRACTIONS:
    cgroup = create_cgroup(CGROUP, cpu_fraction)
    file_handle = None
    workers = []
    try:
      if IS_WARM:
        print("Running in warm mode")
        workers = start_warm_pool(cgroup, CONCURRENCY)
        if IS_BATCH:
          print("Running in batch mode")
          file_handle, writer = create_writer(["elapsed_wall_ms", "cpu_user_ms",
                                              "cpu_sys_ms", "cpu_total_ms", "batch_size", "mode", "source",], cpu_fraction)
          fn = run_N_sequentials_on_parallel_poll
        else:
          file_handle, writer = create_writer(["elapsed_wall_ms", "cpu_user_ms",
                                              "cpu_sys_ms", "cpu_total_ms", "mode", "source",], cpu_fraction)
          fn = run_parallel_pool

        tasks_remaining = TASKS
        while tasks_remaining > 0:
          parallel_size = min(CONCURRENCY, tasks_remaining)
          parallel_workers = workers[:parallel_size]
          print("parallel run:", len(parallel_workers))
          results = fn(parallel_workers)

          for r in results:
            writer.writerow(r)
          tasks_remaining -= parallel_size

      else:
        file_handle, writer = create_writer(["elapsed_wall_ms", "cpu_user_ms",
                                            "cpu_sys_ms", "cpu_total_ms", "mode", "source",], cpu_fraction)
        with ThreadPoolExecutor(max_workers=CONCURRENCY) as pool:
          futures = [
              pool.submit(run_one_cold, cgroup)
              for _ in range(TASKS)
          ]
          for fut in as_completed(futures):
            writer.writerow(fut.result())

    except KeyboardInterrupt:
      break
    finally:
      # shutdown
      for w in workers:
        w["proc"].stdin.write("__EXIT__\n")
        w["proc"].stdin.flush()
        w["proc"].wait()
      delete_cgroup(cgroup)
      if file_handle is not None:
        file_handle.close()


if __name__ == "__main__":
  main()
