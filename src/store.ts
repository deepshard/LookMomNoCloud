import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

interface State {
  socket: WebSocket | null;
  setSocket: (socket: WebSocket | null) => void;
  sendCommand: (command: Command, data: any) => void;
  parseResponse: (response: string) => void;
}

export enum Command {
  SYSINFO = "SYSINFO",
  LAUNCH_MODEL = "LAUNCH_MODEL",
}

const responseSchema = z.object({
  error: z.string().optional(),
  data: z.any(),
  cmd: z.nativeEnum(Command),
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
      const data = responseSchema.parse(JSON.parse(response));
      console.log("<--", data);
      if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("[invalid response]", error);
    }
  },
}));

export default useStore;
