import pandas as pd
import numpy as np
import random
import os
from datetime import datetime

# ------------------ تنظیمات اولیه ------------------
# برای تکرارپذیری نتایج
random.seed(42)
np.random.seed(42)

# تنظیمات شبیه‌سازی
NUM_SERVERS = 8  # تعداد کل سرورها
MAX_RESERVED_SERVERS = 4  # حداکثر سرورهای رزرو شده (m)
REAL_TIME_RATIO = 0.25  # سهم تسک‌های Real-time
DEADLINE_MULTIPLIER_MIN = 3.0  # حداقل ضریب برای محاسبه ددلاین
DEADLINE_MULTIPLIER_MAX = 8.0  # حداکثر ضریب

# سطوح مختلف تعداد سرورهای رزرو شده برای تست
RESERVATION_LEVELS = [0, 1, 2, 3, 4]

# اگر احتمال موفقیت کمتر از این باشه → از سرور رزرو استفاده کن
PROBABILITY_THRESHOLD = 0.80

# نوسان در زمان اجرای واقعی تسک‌ها (±20%)
EXECUTION_VARIANCE_FACTOR = 0.20

# فایل‌های ورودی و خروجی
INPUT_FILE = "Task_Execution_Times_Stage1.xlsx"
OUTPUT_QUEUE_FILE = "Simulation_Queue_With_Reservation.xlsx"
OUTPUT_RESULTS_FILE = "Exhaustive_Search_Reservation_Results.xlsx"


# --------------------------------------------------

def load_task_times():
    """بارگذاری زمان اجرای تسک‌ها از فایل خروجی مرحله اول"""
    if not os.path.exists(INPUT_FILE):
        raise FileNotFoundError(f"فایل {INPUT_FILE} پیدا نشد! ابتدا مرحله اول را اجرا کنید.")

    df = pd.read_excel(INPUT_FILE)
    print(f"بارگذاری {len(df)} تسک از مرحله قبل...")
    return df


def generate_simulation_queue(df_tasks):
    """ساخت صف شبیه‌سازی با مشخصات تسک‌ها (Real-time یا Best-effort)"""
    queue = []

    for idx, row in df_tasks.iterrows():
        task_id = int(row['Task_Number'])
        base_time = row['Task_Time']

        # تصادفی تصمیم بگیر این تسک Real-time هست یا نه
        is_realtime = random.random() < REAL_TIME_RATIO
        task_type = "Real-time" if is_realtime else "Best-effort"

        # اگر Real-time بود، ددلاین تعیین کن
        deadline = None
        if is_realtime:
            deadline_factor = random.uniform(DEADLINE_MULTIPLIER_MIN, DEADLINE_MULTIPLIER_MAX)
            deadline = base_time * deadline_factor

        queue.append({
            "Task_ID": task_id,
            "Arrival_Time": 0.0,  # همه تسک‌ها در زمان 0 وارد می‌شوند
            "Base_Execution_Time": round(base_time, 8),
            "Type": task_type,
            "Deadline": round(deadline, 8) if is_realtime else None,
            "Assigned_Server": None,
            "Start_Time": None,
            "Finish_Time": None,
            "Reserved_Used": False
        })

    df_queue = pd.DataFrame(queue)
    df_queue = df_queue.sort_values("Task_ID").reset_index(drop=True)
    return df_queue


def save_queue_to_excel(df_queue):
    """ذخیره صف تسک‌ها در فایل Excel به همراه شیت تنظیمات"""
    total_realtime = len(df_queue[df_queue["Type"] == "Real-time"])
    total_best_effort = len(df_queue) - total_realtime

    with pd.ExcelWriter(OUTPUT_QUEUE_FILE, engine='openpyxl') as writer:
        df_queue.to_excel(writer, sheet_name="Task_Queue", index=False)

        settings = pd.DataFrame({
            "Parameter": [
                "Total_Tasks",
                "Real-time_Tasks",
                "Best-effort_Tasks",
                "Real-time_Ratio",
                "Number_of_Servers",
                "Max_Reserved_Servers",
                "Deadline_Range_Factor"
            ],
            "Value": [
                len(df_queue),
                total_realtime,
                total_best_effort,
                f"{REAL_TIME_RATIO:.2f}",
                NUM_SERVERS,
                MAX_RESERVED_SERVERS,
                f"{DEADLINE_MULTIPLIER_MIN}–{DEADLINE_MULTIPLIER_MAX}"
            ]
        })
        settings.to_excel(writer, sheet_name="Simulation_Config", index=False)

    print(f"صف شبیه‌سازی ذخیره شد: {os.path.abspath(OUTPUT_QUEUE_FILE)}")


def load_queue():
    """بارگذاری صف تسک‌ها از فایل Excel"""
    if not os.path.exists(OUTPUT_QUEUE_FILE):
        raise FileNotFoundError(f"فایل {OUTPUT_QUEUE_FILE} پیدا نشد! ابتدا مرحله دوم را اجرا کنید.")

    df = pd.read_excel(OUTPUT_QUEUE_FILE, sheet_name="Task_Queue")
    print(f"بارگذاری صف تسک‌ها: {len(df)} تسک")
    return df


def simulate_with_reservation(df_queue, reserved_count):
    """
    شبیه‌سازی اجرای تسک‌ها با تعداد مشخصی سرور رزرو شده
    reserved_count: تعداد سرورهای رزرو شده
    """
    df = df_queue.copy()
    df["Assigned_Server"] = -1
    df["Start_Time"] = 0.0
    df["Finish_Time"] = 0.0
    df["Missed_Deadline"] = False
    df["Used_Reserved"] = False

    # زمان آزاد شدن هر سرور
    server_available_time = [0.0] * NUM_SERVERS

    # تعیین سرورهای رزرو و عادی
    reserved_servers = list(range(NUM_SERVERS - reserved_count, NUM_SERVERS))
    normal_servers = [i for i in range(NUM_SERVERS) if i not in reserved_servers]

    success_count = 0
    reserved_usage_count = 0

    for idx in df.index:
        base_time = df.loc[idx, "Base_Execution_Time"]
        actual_time = base_time * random.uniform(1 - EXECUTION_VARIANCE_FACTOR, 1 + EXECUTION_VARIANCE_FACTOR)
        deadline = df.loc[idx, "Deadline"]
        is_realtime = df.loc[idx, "Type"] == "Real-time"

        start_time = 0.0
        server_idx = -1

        if not is_realtime:
            # تسک عادی → فقط سرورهای عادی
            if normal_servers:
                avail_times = [server_available_time[i] for i in normal_servers]
                server_idx = normal_servers[avail_times.index(min(avail_times))]
            else:
                server_idx = server_available_time.index(min(server_available_time))
        else:
            # تسک Real-time → تصمیم‌گیری هوشمند
            can_meet_deadline = False
            if normal_servers:
                avail_times_normal = [server_available_time[i] for i in normal_servers]
                earliest_normal = min(avail_times_normal)
                if deadline is not None and earliest_normal + actual_time <= deadline:
                    can_meet_deadline = True

            if can_meet_deadline and normal_servers:
                avail_times = [server_available_time[i] for i in normal_servers]
                server_idx = normal_servers[avail_times.index(min(avail_times))]
            else:
                if reserved_servers:
                    avail_times_res = [server_available_time[i] for i in reserved_servers]
                    server_idx = reserved_servers[avail_times_res.index(min(avail_times_res))]
                    reserved_usage_count += 1
                    df.loc[idx, "Used_Reserved"] = True
                else:
                    server_idx = server_available_time.index(min(server_available_time))

        start_time = server_available_time[server_idx]
        finish_time = start_time + actual_time

        df.loc[idx, "Assigned_Server"] = server_idx
        df.loc[idx, "Start_Time"] = round(start_time, 6)
        df.loc[idx, "Finish_Time"] = round(finish_time, 6)

        if is_realtime and deadline is not None:
            if finish_time <= deadline:
                success_count += 1
            else:
                df.loc[idx, "Missed_Deadline"] = True

        server_available_time[server_idx] = finish_time

    # محاسبه معیارهای کلان
    total_realtime = len(df[df["Type"] == "Real-time"])
    success_rate = success_count / total_realtime if total_realtime > 0 else 0
    makespan = max(server_available_time) if server_available_time else 0
    utilization = sum(server_available_time) / (NUM_SERVERS * makespan if makespan > 0 else 1)

    metrics = {
        "Reserved_Servers": reserved_count,
        "RealTime_Total": total_realtime,
        "Success_Count": success_count,
        "Success_Rate": round(success_rate, 5),
        "Missed_Deadlines": total_realtime - success_count,
        "Reserved_Usage_Count": reserved_usage_count,
        "Avg_Utilization": round(utilization, 5),
        "Makespan": round(makespan, 6)
    }

    return df, metrics


def run_exhaustive_search():
    """اجرا Exhaustive Search روی تمام سطوح رزرو"""
    print("=== مرحله سوم: Exhaustive Search روی استراتژی Reservation ===")
    df_queue = load_queue()
    all_results = []
    all_detailed_dfs = {}

    for reserved in RESERVATION_LEVELS:
        print(f"در حال شبیه‌سازی با {reserved} سرور رزرو شده...")
        df_sim, metrics = simulate_with_reservation(df_queue, reserved)
        all_results.append(metrics)
        all_detailed_dfs[f"Reserved_{reserved}"] = df_sim
        print(
            f"   → Success Rate = {metrics['Success_Rate']:.4f} | Reserved Used = {metrics['Reserved_Usage_Count']}\n")

    # انتخاب بهترین تنظیم
    df_summary = pd.DataFrame(all_results)
    best_row = df_summary.loc[df_summary["Success_Rate"].idxmax()]

    print("بهترین تنظیم پیدا شد:")
    print(f"   تعداد سرور رزرو شده: {int(best_row['Reserved_Servers'])}")
    print(f"   درصد موفقیت: {best_row['Success_Rate']:.4%}")
    print(f"   تعداد استفاده از رزرو: {int(best_row['Reserved_Usage_Count'])}")

    # ذخیره نتایج در اکسل
    with pd.ExcelWriter(OUTPUT_RESULTS_FILE, engine='openpyxl') as writer:
        df_summary.to_excel(writer, sheet_name="Comparison", index=False)

        for sheet_name, df_detail in all_detailed_dfs.items():
            df_detail.to_excel(writer, sheet_name=sheet_name, index=False)

        best_df = all_detailed_dfs[f"Reserved_{int(best_row['Reserved_Servers'])}"]
        best_df.to_excel(writer, sheet_name="BEST_CONFIGURATION", index=False)

    print(f"\nنتایج Exhaustive Search ذخیره شد: {os.path.abspath(OUTPUT_RESULTS_FILE)}")


def main():
    print("=== مرحله دوم: ساخت محیط شبیه‌سازی با صف تسک‌ها ===")
    print(f"تاریخ و زمان اجرا: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # مرحله دوم
    df_tasks = load_task_times()
    df_queue = generate_simulation_queue(df_tasks)
    save_queue_to_excel(df_queue)

    print("\nنمونه ۱۰ تسک اول از صف:")
    print(df_queue.head(10)[["Task_ID", "Type", "Base_Execution_Time", "Deadline"]].to_string(index=False))

    print("\nمرحله دوم با موفقیت تکمیل شد!\n")

    # مرحله سوم
    print("شروع مرحله سوم — Exhaustive Search")
    run_exhaustive_search()
    print("\nتمام! مرحله سوم با موفقیت به پایان رسید.")
    print("آماده‌ام برای مرحله چهارم: مقایسه با الگوریتم‌های هوشمند (, MOEA/D, RL, ...)")


if __name__ == "__main__":
    main()