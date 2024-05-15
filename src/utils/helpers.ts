export function formatLargeNumber(num: number): string {
    if (num < 1000) return num.toString();

    const units = ["K", "M", "G", "T", "P", "E"];
    const unitIndex = Math.min(Math.floor(Math.log10(num) / 3), units.length - 1);
    const reducedNum = num / Math.pow(1000, unitIndex);

    return reducedNum.toFixed(1) + units[unitIndex];
}