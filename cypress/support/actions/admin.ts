import { signIn } from "./user";
import { gotoMainMenuPage } from "./nav";
import { waitForPageReady } from "./common";

export function resetData() {
  cy.exec("yarn run reset-data", { log: true });
}

export function signInAsAdmin() {
  signIn(Cypress.env("ADMIN_USER"), Cypress.env("ADMIN_PASSWORD"));
}

export function uploadAssets() {
  const fixtures = Cypress.config("fixturesFolder");
  gotoMainMenuPage("Assets");
  cy.selectFileByName("mapInfo", `${fixtures}/mapInfo.lub`);
  cy.selectFileByName("itemInfo", `${fixtures}/itemInfo.lub`);
  cy.selectFileByName("data", `${fixtures}/data.grf`);
  cy.findByRole("button", { name: "Upload" }).click();

  // Uploads will cause the API to rebuild cache a lot which can take some time,
  // so having a long timeout here is a good safety measure against flake.
  waitForPageReady(60 * 1000 * 2);

  cy.contains("Upload completed");
  cy.contains("Errors during upload").should("not.exist");
}

export function ensureAssets() {
  signInAsAdmin();
  uploadAssets();
}
