import toast from "react-hot-toast";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { z } from "zod";
import { infer as Infer } from "zod";

export enum Command {
  SYSINFO = "SYSINFO",
  HEALTH = "HEALTH",
  GET_MODEL_STATE = "GET_MODEL_STATE",
  DOWNLOAD_MODEL = "DOWNLOAD_MODEL",
  CONVERT_WEIGHTS = "CONVERT_WEIGHTS",
  LAUNCH_MODEL = "LAUNCH_MODEL",
  STOP_MODEL = "STOP_MODEL",
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
  // modelsState: Infer<typeof modelStateSchema> | null;
  downloadProgress: Infer<typeof downloadModelSchema> | null;
  conversionProgress: Infer<typeof convertWeightsSchema> | null;
  modelsState: {
    [id: string]: Infer<typeof launchModelSchema>;
  };
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

const modelStateSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    pid: z.number(),
    port: z.number(),
    quant: z.string(),
    size: z.number(),
  })
);

const downloadModelSchema = z.array(
  z.object({
    name: z.string(),
    path: z.string(),
    progress: z.number(),
  })
);

const convertWeightsSchema = z.object({
  name: z.string(),
  path: z.string(),
  quant: z.string(),
  status: z.string(),
});

export const launchModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  pid: z.number().optional(),
  port: z.number().optional(),
  quant: z.enum(["int8", "int4", "no-quant"]),
  size: z.number(),
  progress: z.number().optional(),
  status: z.enum(["DOWNLOADING", "INSTALL_QUEUED", "INSTALLING", "RUNNING"]),
});

const stopModelResponseSchema = z.string();

const useStore = create<State>()(
  devtools(
    (set) => ({
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

            case Command.GET_MODEL_STATE:
              const modelsState = modelStateSchema.parse(data.data);
              set({ modelsState });
              break;

            case Command.DOWNLOAD_MODEL:
              const downloadProgress = downloadModelSchema.parse(data.data);
              set({ downloadProgress });
              break;

            case Command.CONVERT_WEIGHTS:
              const conversionProgress = convertWeightsSchema.parse(data.data);
              set({ conversionProgress });
              break;

            case Command.LAUNCH_MODEL:
              const launchModelStream = launchModelSchema.parse(data.data);
              set((state) => {
                return {
                  modelsState: {
                    ...state.modelsState,
                    [launchModelStream.id]: launchModelStream,
                  },
                };
              });
              break;

            case Command.STOP_MODEL:
              const stopModelResponse = stopModelResponseSchema.parse(
                data.data
              );
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
      downloadProgress: null,
      conversionProgress: null,
      modelsState: {},
    }),
    { name: "store" }
  )
);

export default useStore;
