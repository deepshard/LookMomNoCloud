export function bytesToHumanReadable(bytes?: number, withUnit = true): string {
  if (!bytes) return ' - ';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const exponent = bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0;
  const result = (bytes / Math.pow(1024, exponent)).toFixed(2);
  return withUnit ? `${result} ${units[exponent]}` : result;
}
