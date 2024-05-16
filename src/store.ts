import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import { infer as Infer } from "zod";

export enum Command {
  SYSINFO = "SYSINFO",
  HEALTH = "HEALTH",
}

const responseSchema = z.object({
  error: z.string().optional(),
  data: z.any(),
  cmd: z.nativeEnum(Command),
});

interface State {
  socket: WebSocket | null;
  setSocket: (socket: WebSocket | null) => void;
  sendCommand: (command: Command, data: any) => void;
  parseResponse: (response: string) => void;
  sysinfo: Infer<typeof sysinfoSchema> | null;
  health: Infer<typeof healthSchema> | null;
}

const sysinfoSchema = z.object({
  os: z.string(),
  ram_used: z.number(),
  ram_total: z.number(),
  disk_used: z.number(),
  disk_total: z.number(),
  models: z.array(z.any()),
});

const healthSchema = z.object({
  status: z.literal("OK"),
});

const useStore = create<State>()((set) => ({
  socket: null,
  setSocket: (socket: WebSocket | null) => set({ socket }),
  sendCommand: (command: Command, data: any) =>
    set((state) => {
      console.log("-->", { cmd: command, data });
      state.socket?.send(JSON.stringify({ cmd: command, data }));
      return {};
    }),
  parseResponse: (response: string) => {
    try {
      let data = responseSchema.parse(JSON.parse(response));
      console.log("<--", data);
      if (data.error) {
        toast.error(data.error);
      }

      switch (data.cmd) {
        case Command.HEALTH:
          const health = healthSchema.parse(data.data);
          set({ health });
          break;

        case Command.SYSINFO:
          const sysinfo = sysinfoSchema.parse(data.data);
          set({ sysinfo });
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("[invalid response]", error);
    }
  },
  sysinfo: null,
  health: null,
}));

export default useStore;
