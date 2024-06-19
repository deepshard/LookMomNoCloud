export function bytesToHumanReadable(bytes?: number, withUnit = true, decimals = 2): string {
  if (!bytes) return ' - ';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const exponent = bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0;
  const result = (bytes / Math.pow(1024, exponent)).toFixed(decimals);
  return withUnit ? `${result} ${units[exponent]}` : result;
}


export const toUnitOfCount = (size: number) => {
  if (size >= 1e12) {
    return `${(size / 1e12).toFixed(1)}T`;
  } else if (size >= 1e9) {
    return `${(size / 1e9).toFixed(1)}B`;
  } else if (size >= 1e6) {
    return `${(size / 1e6).toFixed(1)}M`;
  } else if (size >= 1e3) {
    return `${(size / 1e3).toFixed(1)}K`;
  } else {
    return `${size}B`;
  }

}
  
export function roundTo(n: number, decimals: number): number {
  return Number(n.toFixed(decimals));
}