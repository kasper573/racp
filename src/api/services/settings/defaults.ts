import { AdminSettings, Currency } from "./types";

export const defaultAdminSettings: AdminSettings = {
  rAthenaMode: "Renewal",
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
