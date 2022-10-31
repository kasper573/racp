import { gotoMainMenuPage } from "../support/actions/nav";
import { register } from "../support/actions/user";
import { nextTestUser, TestUser } from "../fixtures/users";
import { ignoreCase } from "../support/util";
import { expectTableColumn } from "../support/actions/grid";
import { resetData } from "../support/actions/admin";
import { waitForPageReady } from "../support/actions/common";

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

  describe("hunts", () => {
    beforeEach(() => {
      cy.findByRole("button", { name: /create new hunt/i }).click();
    });

    it("can create new hunt", () => {
      findListedHuntTitle("new hunt").should("exist");
    });

    it("can delete hunt", () => {
      cy.findByRole("button", { name: /delete hunt/i }).click();
      cy.findByRole("dialog").findByRole("button", { name: /ok/i }).click();
      findListedHuntTitle("new hunt").should("not.exist");
    });

    it("can rename hunt", () => {
      findListedHuntTitle("new hunt").clear().type("renamed hunt");
      findListedHuntTitle("renamed hunt").should("exist");
    });

    describe("details", () => {
      beforeEach(() => {
        cy.findByRole("link", { name: /view hunt/i }).click();
      });

      it("can add item to hunt", () => {
        addItemToHunt("test item");
        expectTableColumn("Item", () => /test item/i);
      });

      it("can remove item from hunt", () => {
        addItemToHunt("test item");
        cy.findByRole("button", { name: /remove item/i }).click();
        expectTableColumn("Item", () => /test item/i).should("not.exist");
      });
    });
  });
});

function findListedHuntTitle(huntName: string) {
  return cy.findByRole("heading", { name: ignoreCase(huntName) });
}

function addItemToHunt(itemName: string) {
  cy.findByLabelText("Add an item to hunt").type(itemName);
  waitForPageReady();
  cy.findByRole("option", {
    name: ignoreCase(itemName, { exact: false }),
  }).click();
}
