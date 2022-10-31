import { gotoMainMenuPage } from "../support/actions/nav";

describe("guest", () => {
  it("does not have access to hunt feature", () => {
    gotoMainMenuPage("Hunt");
    cy.contains("You need to sign in");
  });
});
