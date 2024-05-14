export function formatLargeNumber(num: number): string {
    if (num < 1000) return num.toString();

    const units = ["K", "M", "G", "T", "P", "E"];
    let unitIndex = -1;
    let reducedNum = num;

    while (reducedNum >= 1000 && unitIndex < units.length - 1) {
        reducedNum /= 1000;
        unitIndex++;
    }

    // Use toFixed to control decimal places (e.g., 1.2K instead of 1.234K)
    return reducedNum.toFixed(1) + units[unitIndex];
}