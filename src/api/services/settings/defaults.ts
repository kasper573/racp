import { AdminSettings, ZenyColor } from "./types";

export const defaultAdminSettings: AdminSettings = {
  public: {
    zenyColors: {
      dark: defaultZenyColors("white"),
      light: defaultZenyColors("black"),
    },
    pageTitle: "rAthenaCP",
  },
  internal: {},
};

function defaultZenyColors(primary: string): ZenyColor[] {
  return [
    [0, primary],
    [10000, "#00ff00"],
    [100000, "#ffff00"],
    [1000000, "#ff8000"],
    [10000000, "#ff0000"],
  ];
}
