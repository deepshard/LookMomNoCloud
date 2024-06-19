export function bytesToHumanReadable(bytes?: number, withUnit = true, decimals = 2): string {
  if (!bytes) return ' - ';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const exponent = bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0;
  const result = (bytes / Math.pow(1024, exponent)).toFixed(decimals);
  return withUnit ? `${result} ${units[exponent]}` : result;
}
