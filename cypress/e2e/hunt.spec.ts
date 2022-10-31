import { gotoMainMenuPage } from "../support/actions/nav";
import { register } from "../support/actions/user";
import { nextTestUser, TestUser } from "../fixtures/users";
import { resetData } from "../support/actions/admin";
import { ignoreCase } from "../support/util";
import { expectTableColumn } from "../support/actions/grid";

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
    findListedHuntTitle("new hunt").should("exist");
  });

  it("can delete hunt", () => {
    cy.findByRole("button", { name: /create new hunt/i }).click();
    cy.findByRole("button", { name: /delete hunt/i }).click();
    cy.findByRole("dialog").findByRole("button", { name: /ok/i }).click();
    findListedHuntTitle("new hunt").should("not.exist");
  });

  it("can rename hunt", () => {
    cy.findByRole("button", { name: /create new hunt/i }).click();
    findListedHuntTitle("new hunt").clear().type("renamed hunt");
    findListedHuntTitle("renamed hunt").should("exist");
  });

  it("can add item to hunt", () => {
    cy.findByRole("button", { name: /create new hunt/i }).click();
    cy.findByRole("link", { name: /view hunt/i }).click();
    cy.findByLabelText("Add an item to hunt").type("test it");
    cy.findByRole("option", { name: /test item/i }).click();
    expectTableColumn("Item", () => /test item/i);
  });
});

function findListedHuntTitle(huntName: string) {
  return cy.findByRole("heading", { name: ignoreCase(huntName) });
}
