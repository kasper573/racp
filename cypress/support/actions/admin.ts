import { signIn } from "./user";
import { gotoMainMenuPage } from "./nav";

export function resetData() {
  cy.exec("yarn reset-data", { log: true });
}

export function signInAsAdmin() {
  signIn(Cypress.env("ADMIN_USER"), Cypress.env("ADMIN_PASSWORD"));
}

export function uploadAssets() {
  const fixtures = Cypress.config("fixturesFolder");
  gotoMainMenuPage("Assets", { menuName: "Admin" });
  cy.selectFileByName("mapInfo", `${fixtures}/mapInfo_prontera.lub`);
  cy.selectFileByName("itemInfo", `${fixtures}/itemInfo_red-potion.lub`);
  cy.selectFileByName("data", `${fixtures}/prontera_poring_red-potion.grf`);
  cy.findByRole("button", { name: "Upload" }).click();

  // For some reason there is flakiness in how long the upload takes only in cypress.
  // Most of the time it's fast, but for the off chance that it's slow we raise the timeout.
  cy.contains("Upload completed", { timeout: 60000 });
  cy.contains("Errors during upload").should("not.exist");
}
