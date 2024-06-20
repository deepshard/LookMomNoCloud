
export function bytesToHumanReadable(bytes?: number, withUnit = true, decimals = 2): string {
  if (!bytes) return ' - ';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const exponent = bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0;
  const result = (bytes / Math.pow(1024, exponent)).toFixed(decimals);
  return withUnit ? `${result} ${units[exponent]}` : result;
}

export function formatDate(dateString: string | undefined) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatParams(size: number | undefined): string {
  if (!size) return "0";
  if (size >= 1e12) return (size / 1e12).toFixed(1).replace(/\.0$/, "") + "T"; //trillion
  if (size >= 1e9) return (size / 1e9).toFixed(1).replace(/\.0$/, "") + "B";   //billion 
  if (size >= 1e6) return (size / 1e6).toFixed(1).replace(/\.0$/, "") + "M";   //million
  if (size >= 1e3) return (size / 1e3).toFixed(1).replace(/\.0$/, "") + "K";   //thousand
  return size.toString();
}

export function roundTo(n: number, decimals: number): number {
  return Number(n.toFixed(decimals));
}

