import { AdminSettings, Currency, ZenyColor } from "./types";

export const defaultAdminSettings: AdminSettings = {
  zenyColors: {
    dark: defaultZenyColors("white"),
    light: defaultZenyColors("black"),
  },
  pageTitle: "rAthenaCP",
  donations: {
    enabled: false,
    defaultAmount: 5,
    exchangeRate: 10,
    currency: "USD" as Currency,
    presentation:
      "Donations are welcome, but not required!\n\n" +
      "As a thank you, donations will be rewarded with credits that can be traded for in-game items.",
    accRegNumKey: "#CASHPOINTS",
    paypal: {
      merchantId: "",
      clientId: "",
      clientSecret: "",
    },
  },
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
