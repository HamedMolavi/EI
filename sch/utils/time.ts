export function showTime(timestamp: number) {
  const dif = timestamp - process.conf.startTime;
  const str = timestamp.toString();
  const last = str.length
  return (dif / 1000).toFixed() + ' sec - ' + str.substring(last - 3) + ' ms'
}