import { gotoMainMenuPage } from "../support/actions/nav";
import { register } from "../support/actions/user";
import { nextTestUser, TestUser } from "../fixtures/users";
import { ignoreCase } from "../support/util";
import { expectTableColumn } from "../support/actions/grid";
import { resetData } from "../support/actions/admin";
import { waitForPageReady } from "../support/actions/common";

let user: TestUser;
before(() => {
  resetData();
  cy.visit("/"); // New visitor each test
  user = nextTestUser();
  register(user.name, user.password, user.email);
  gotoMainMenuPage("Hunt");
});

describe("list", () => {
  before(() => {
    cy.findByRole("button", { name: /create new hunt/i }).click();
  });
  it("can create new hunt", () => {
    findListedHuntTitle("new hunt").should("exist");
  });

  it("can rename hunt", () => {
    findListedHuntTitle("new hunt").clear().type("renamed hunt");
    findListedHuntTitle("renamed hunt").should("exist");
  });

  it("can delete hunt", () => {
    cy.findByRole("button", { name: /delete hunt/i }).click();
    cy.findByRole("dialog").findByRole("button", { name: /ok/i }).click();
    findListedHuntTitle("new hunt").should("not.exist");
  });
});

describe("details", () => {
  before(() => {
    createHunt({ itemAmount: 5, killsPerUnit: 7 });
    waitForPageReady();
  });

  it("can add item", () => {
    withinItemGrid(() => expectTableColumn("Item", () => /test item/i));
  });

  it("can estimate farm time in kills per minute", () => {
    cy.get("#KillScale").select("Kills per minute");
    withinItemGrid(() => {
      expectTableColumn("Estimate", () => /57s/i);
    });
  });

  it("can estimate farm time in kills per minute", () => {
    cy.get("#KillScale").select("Kills per hour");
    withinItemGrid(() => {
      expectTableColumn("Estimate", () => /57m 8s/i);
    });
  });

  it("can estimate farm time in kills per minute", () => {
    cy.get("#KillScale").select("Kills per day");
    withinItemGrid(() => {
      expectTableColumn("Estimate", () => /22h 51m/i);
    });
  });

  it("can estimate farm time using multiplier", () => {
    cy.get("#KillScale").select("Kills per day");
    cy.findByLabelText("Drop Rate Multiplier").clear().type("15");
    withinItemGrid(() => {
      expectTableColumn("Estimate", () => /1h 31m/i);
    });
  });

  it("can remove item", () => {
    withinItemGrid(() => {
      cy.findByRole("button", { name: /remove item/i }).click();
      cy.contains("No items have been added to the hunt");
    });
  });
});

function findListedHuntTitle(huntName: string) {
  return cy.findByRole("heading", { name: ignoreCase(huntName) });
}

function createHunt({ itemAmount = 1, killsPerUnit = 1 }) {
  cy.findByRole("button", { name: /create new hunt/i }).click();
  cy.findByRole("link", { name: /view hunt/i }).click();
  addItemToHunt("test item");
  setItemAmount(itemAmount);
  setItemTarget(0);
  setKillsPerUnit(killsPerUnit);
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
