import { Random } from "random"
const random = new Random();

//mem: KB, net: Mib, cpu: Hz, deadlineT: ms
export const TASK_TYPES = {
  'poisson_image_processing': {
    taskType: 'poisson_image_processing',
    value: 1, cpu: 28_000_000, mem: 256, net: 5,
    dist: random.poisson(28_000_000),
    sensitive: true, isSoftDeadline: false, deadlineT: 20,
  },
  'normal_image_processing': {
    taskType: 'normal_image_processing',
    value: 1, cpu: 28_000_000, mem: 256, net: 5,
    dist: random.normal(28_000_000, 5_000_000),
    sensitive: true, isSoftDeadline: false, deadlineT: 20,
  },
}

export const REWARDS = {
  'hard-sensitive-complete': (...args: any[]) => 1,
  'hard-sensitive-violate': (...args: any[]) => -1,
  'soft-sensitive-complete': (...args: any[]) => 1,
  'soft-sensitive-violate': (...args: any[]) => -1,
  'insensitive': (...args: any[]) => 1,
}