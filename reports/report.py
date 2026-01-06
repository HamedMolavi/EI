import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
input_dir = "./experiments/execution_time/image_processing/"


def load_data(file_path):
  """Load numerical data from a file where each line has two comma-separated values."""
  data = np.loadtxt(file_path, delimiter=',', skiprows=1)
  return data[:, 0], data[:, 1]  # Splitting into two separate arrays


def compute_statistics(system_times, program_times):
  """Compute important statistical insights between the two datasets."""
  stats = {
      "System Mean": np.mean(system_times), "Program Mean": np.mean(program_times),
      "System Median": np.median(system_times), "Program Median": np.median(program_times),
      "System Variance": np.var(system_times), "Program Variance": np.var(program_times),
      "System Std Dev": np.std(system_times), "Program Std Dev": np.std(program_times),
      "System Min": np.min(system_times), "Program Min": np.min(program_times),
      "System Max": np.max(system_times), "Program Max": np.max(program_times),
      "Correlation": np.corrcoef(system_times, program_times)[0, 1],
  }
  return stats


def save_report(stats, output_file="report.txt"):
  with open(output_file, 'w') as file:
    file.write("Statistical Report\n")
    file.write("=" * 50 + "\n")
    for key, value in stats.items():
      file.write(f"{key}: {value:.5f}\n")
    file.write("=" * 50 + "\n")


def generate_plots(system_times, program_times, output_folder="plots"):
  """Generate various plots and save them as images."""
  if not os.path.exists(output_folder):
    os.makedirs(output_folder)

  # Histogram
  # Assuming system_times and program_times are your data lists
  xmin_system = min(system_times)
  xmax_system = max(system_times)
  xmin_program = min(program_times)
  xmax_program = max(program_times)
  plt.figure(figsize=(12, 6))
  plt.subplot(1, 2, 1)  # 1 row, 2 columns, first plot
  plt.hist(system_times, bins=30, alpha=0.5, label="System Times", color='blue')
  plt.xlim(xmin_system, xmax_system)  # Dynamic x-axis limits for system times
  plt.xlabel("Run Time")
  plt.ylabel("Frequency")
  plt.legend()
  plt.title("Histogram of System Times")
  plt.subplot(1, 2, 2)  # 1 row, 2 columns, second plot
  plt.hist(program_times, bins=30, alpha=0.5, label="Program Times", color='orange')
  plt.xlim(xmin_program, xmax_program)  # Dynamic x-axis limits for program times
  plt.xlabel("Run Time")
  plt.ylabel("Frequency")
  plt.legend()
  plt.title("Histogram of Program Times")
  plt.tight_layout() # Adjust layout to prevent overlapping
  plt.savefig(f"{output_folder}/histogram.png")
  plt.close()

  # Boxplot
  plt.figure(figsize=(8, 5))
  sns.boxplot(data=[system_times, program_times], palette=["blue", "orange"])
  plt.xticks([0, 1], ["System Times", "Program Times"])
  plt.title("Boxplot of Run Times")
  plt.savefig(f"{output_folder}/boxplot.png")
  plt.close()

  # Probability Density Function (PDF)
  plt.figure(figsize=(12, 6))
  plt.subplot(1, 2, 1)  # 1 row, 2 columns, first plot
  sns.kdeplot(system_times, label="System Times", color='blue', fill=True)
  plt.xlim(xmin_system, xmax_system)  # Dynamic x-axis limits for system times
  plt.xlabel("Run Time")
  plt.ylabel("Density")
  plt.legend()
  plt.title("Probability Density Function (PDF) - System Times")
  plt.subplot(1, 2, 2)  # 1 row, 2 columns, second plot
  sns.kdeplot(program_times, label="Program Times", color='orange', fill=True)
  plt.xlim(xmin_program, xmax_program)  # Dynamic x-axis limits for program times
  plt.xlabel("Run Time")
  plt.ylabel("Density")
  plt.legend()
  plt.title("Probability Density Function (PDF) - Program Times")
  plt.tight_layout() # Adjust layout to prevent overlapping
  plt.savefig(f"{output_folder}/pdf.png")
  plt.close()

  # Scatter Plot with Regression Line
  plt.figure(figsize=(8, 5))
  sns.regplot(x=system_times, y=program_times, scatter_kws={
              "alpha": 0.5}, line_kws={"color": "red"})
  plt.xlabel("System Observed Time")
  plt.ylabel("Program Observed Time")
  plt.title("Scatter Plot with Regression Line")
  plt.savefig(f"{output_folder}/scatter.png")
  plt.close()


def checked(file):
  return any(map(lambda el: el == ('plot-'+file).replace(".txt",""), os.listdir(input_dir)))


def main():
  # Change this to your actual file name
  for file in filter(lambda el: el.find(".txt") > 0 and not checked(el), os.listdir(input_dir)):
    system_times, program_times = load_data(input_dir + file)
    print(file)
    continue
    # Generate visualizations
    generate_plots(system_times, program_times, (input_dir+'plot-'+file).replace(".txt",""))
    # Compute statistics and save report
    stats = compute_statistics(system_times, program_times)
    save_report(stats, (input_dir+'plot-'+file).replace(".txt","") + 'report-' + file)

    print(file, "Statistical analysis and visualizations completed!")


if __name__ == "__main__":
  main()
