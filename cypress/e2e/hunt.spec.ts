import { gotoMainMenuPage } from "../support/actions/nav";
import { register } from "../support/actions/user";
import { nextTestUser, TestUser } from "../fixtures/users";
import { resetData } from "../support/actions/admin";

// New visitor each test
beforeEach(() => {
  resetData();
  cy.visit("/");
});

describe("guest", () => {
  it("does not have access to hunt feature", () => {
    gotoMainMenuPage("Hunt");
    cy.contains("You need to sign in");
  });
});

describe("user", () => {
  let user: TestUser;
  beforeEach(() => {
    user = nextTestUser();
    register(user.name, user.password, user.email);
    gotoMainMenuPage("Hunt");
  });

  it("has access to hunt feature", () => {
    cy.contains("You need to sign in").should("not.exist");
  });

  it("can create new hunt", () => {
    cy.findByRole("button", { name: /create new hunt/i }).click();
    cy.findByRole("heading", { name: /new hunt/i }).should("exist");
  });
});
