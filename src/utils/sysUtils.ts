import os from "os";
import pidusage from "pidusage";
import diskusage from "diskusage";

export async function getPidMemoryUsage(pids: number[]) {
    const memoryChecks = pids.map((pid) => {
        return new Promise((resolve) => {
            pidusage(pid, (err, stats) => {
                if (err) {
                    resolve(null);
                } else {
                    resolve(stats.memory);
                }
            });
        });
    });

    return await Promise.all(memoryChecks);
}

export async function getDiskUsage() {
    const { free, total } = await diskusage.check(os.platform() === "win32" ? "C:" : "/");
    const used = total - free;

    return {
        used,
        total,
    };
}