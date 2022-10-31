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

      describe("item", () => {
        beforeEach(() => {
          addItemToHunt("test item");
        });

        it("can add", () => {
          withinItemGrid(() => expectTableColumn("Item", () => /test item/i));
        });

        it("can remove", () => {
          withinItemGrid(() => {
            cy.findByRole("button", { name: /remove item/i }).click();
            expectTableColumn("Item", () => /test item/i).should("not.exist");
          });
        });

        it("can set amount", () => {
          setItemAmount(5).should("have.value", "5");
        });

        it("can set target", () => {
          setItemTarget(0);
          withinMonsterGrid(() =>
            expectTableColumn("Monster", () => /test monster/i)
          );
        });

        it("can set monster kill speed", () => {
          setItemTarget(0);
          setKillsPerUnit(7).should("have.value", "7");
        });
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
  waitForPageReady();
}

function setItemAmount(itemAmount: number) {
  return cy.get("#ItemAmount").clear().type(`${itemAmount}`);
}

function setItemTarget(index: number) {
  cy.get("#ItemTargets").select(index);
  waitForPageReady();
}

function setKillsPerUnit(kills: number) {
  return cy.get("#KillsPerUnit").clear().type(`${kills}`);
}

function withinItemGrid(fn: () => void) {
  cy.findByRole("grid", { name: /items/i }).within(fn);
}

function withinMonsterGrid(fn: () => void) {
  cy.findByRole("grid", { name: /monsters/i }).within(fn);
}
