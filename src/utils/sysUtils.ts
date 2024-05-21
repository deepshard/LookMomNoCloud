import os from "os";
import pidusage from "pidusage";
import diskusage from "diskusage";

interface PidStats {
  memory: number;
}

export async function getPidMemoryUsage(
  pids: number[]
): Promise<(number | null)[]> {
  const memoryChecks = pids.map((pid) => {
    return new Promise<number | null>((resolve) => {
      pidusage(pid, (err, stats: PidStats) => {
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

interface DiskUsageStats {
  used: number;
  total: number;
}

export async function getDiskUsage(): Promise<DiskUsageStats> {
  const { free, total } = await diskusage.check(
    os.platform() === "win32" ? "C:" : "/"
  );
  const used = total - free;

  return {
    used,
    total,
  };
}
