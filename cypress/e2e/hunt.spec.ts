import { gotoMainMenuPage } from "../support/actions/nav";
import { register, signOut } from "../support/actions/user";
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
    createHuntWithData({ itemAmount: 5, killsPerUnit: 7 });
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

describe("sharing", () => {
  it("can view someone else's hunt as guest", () => {
    createHuntWithData({ itemAmount: 4, killsPerUnit: 8 });
    cy.url().then((huntUrl) => {
      signOut();
      cy.visit(huntUrl);
      waitForPageReady();

      withinItemGrid(() => {
        expectTableColumn("Item", () => /test item \[3]/i);
        expectTableColumn("Amount", () => /^4$/);
        expectTableColumn("Estimate", () => /^40s$/i);
      });

      withinMonsterGrid(() => {
        expectTableColumn("Monster", () => /test monster/i);
        expectTableColumn(/map/i, () => /test_map/i);
        expectTableColumn("Kills per minute", () => /^8$/);
      });
    });
  });
});

function findListedHuntTitle(huntName: string) {
  return cy.findByRole("heading", { name: ignoreCase(huntName) });
}

function createHuntWithData({ itemAmount = 1, killsPerUnit = 1 }) {
  const name = "test item";
  const nameRegex = ignoreCase(name, { exact: false });

  cy.findByRole("button", { name: /create new hunt/i }).click();
  cy.findByRole("link", { name: /view hunt/i }).click();

  cy.findByLabelText("Add an item to hunt").type(name);
  waitForPageReady();
  cy.findByRole("option", { name: nameRegex }).click();
  waitForPageReady();

  cy.get("#ItemAmount").clear().type(`${itemAmount}`);
  cy.get("#ItemTargets").select(0);
  waitForPageReady();

  cy.get("#KillsPerUnit").clear().type(`${killsPerUnit}`);
  cy.get("#MonsterSpawn").select(0);
  waitForPageReady();
}

function withinItemGrid(fn: () => void) {
  cy.findByRole("grid", { name: /items/i }).within(fn);
}

function withinMonsterGrid(fn: () => void) {
  cy.findByRole("grid", { name: /monsters/i }).within(fn);
}
