import { RAthenaMode } from "../../options";

export const nonEmptyLines = (s: string) =>
  s.split(/[\r\n]+/).filter((l) => l.trim());

export const removeComments = (s: string) =>
  s.replaceAll(/\/\/.*$/gm, "").replaceAll(/\/\*(.|[\r\n])*?\*\//gm, "");

export const modeFolderNames: Record<RAthenaMode, string> = {
  Renewal: "re",
  Prerenewal: "pre-re",
};
