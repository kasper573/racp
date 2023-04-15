import { AdminSettings, Currency } from "./types";

export const defaultAdminSettings: AdminSettings = {
  rAthenaMode: "Renewal",
  pageTitle: "rAthenaCP",
  homePageBannerTitle: "rAthena Control Panel",
  homePageContent:
    "Welcome to rAthenaCP!\n\n" +
    "The landing page can be edited in the admin settings and supports [markdown](https://commonmark.org) out of the box.\n\n" +
    "You can also fork RACP and completely customize your landing page by editing `src/app/pages/HomePage.`",
  huntLimits: {
    hunts: 99,
    monstersPerItem: 99,
    itemsPerHunt: 99,
  },
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
  mainMenuLinks: {},
};
