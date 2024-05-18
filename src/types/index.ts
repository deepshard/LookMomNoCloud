import { launchModelSchema } from "src/store";
import { infer } from "zod";

export interface IModel extends infer<typeof launchModelSchema> {
  id: string;
  title: string;
  size: number;
  author: string;
  downloads: number;
  likes: number;
  intro: string;
  capabilities: string;
  risks: string;
  hfLink: string;
  evalId?: string;
  eval?: IEval;
}

export interface IEval {
  id: string;
  MMLU?: number;
  HellaSwag?: number;
  SWEBench?: number;
  HumanEval?: number;
  model?: IModel;
}

export interface IDownloadProgress {
  currentFileNum: number;
  totalFiles: number;
  currentProgress: number;
}

export interface IModelServerInfo {
  [key: string]: string;
}
