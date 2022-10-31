import { gotoMainMenuPage } from "../support/actions/nav";
import { register } from "../support/actions/user";
import { nextTestUser, TestUser } from "../fixtures/users";

// New visitor each test
beforeEach(() => cy.visit("/"));

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
  });

  it("has access to hunt feature", () => {
    gotoMainMenuPage("Hunt");
    cy.contains("You need to sign in").should("not.exist");
  });
});
