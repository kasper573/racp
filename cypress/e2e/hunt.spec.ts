import { gotoMainMenuPage } from "../support/actions/nav";
import { register, signOut } from "../support/actions/user";
import { nextTestUser, TestUser } from "../fixtures/users";
import { ignoreCase } from "../support/util";
import { expectTableColumn } from "../support/actions/grid";
import { resetData } from "../support/actions/admin";
import { waitForPageReady } from "../support/actions/common";

before(resetData);

let user: TestUser;
function gotoHuntsPageAsNewUser() {
  cy.visit("/"); // New visitor each test is a quicker way to get a clean slate than resetting all data
  user = nextTestUser();
  register(user.name, user.password, user.email);
  gotoMainMenuPage("Item tracker");
}

const defaultHuntName = "new list";

describe("list", () => {
  beforeEach(() => {
    gotoHuntsPageAsNewUser();
    createHunt();
    waitForPageReady();
  });

  it("can create new list", () => {
    findListedHuntTitle(defaultHuntName).should("exist");
  });

  it("can rename list", () => {
    viewHunt();
    cy.findByLabelText("List name").clear().type("renamed list");
    gotoMainMenuPage("Item tracker");
    findListedHuntTitle("renamed list").should("exist");
  });

  it("can delete list", () => {
    cy.findByRole("button", { name: /delete list/i }).click();
    cy.findByRole("dialog").findByRole("button", { name: /ok/i }).click();
    findListedHuntTitle(defaultHuntName).should("not.exist");
  });
});

describe("details", () => {
  before(() => {
    gotoHuntsPageAsNewUser();
    createHuntWithDetails({ itemAmount: 5, killsPerUnit: 7 });
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
      cy.contains("No items have been added to the list");
    });
  });
});

describe("sharing", () => {
  it("is private by default", () => {
    gotoHuntsPageAsNewUser();
    createHunt();
    viewHunt();
    cy.url().then((huntUrl) => {
      signOut();
      cy.visit(huntUrl);
      cy.contains("Unknown list");
    });
  });

  it("can publish", () => {
    gotoHuntsPageAsNewUser();
    createHuntWithDetails({ itemAmount: 4, killsPerUnit: 8, publish: true });
    cy.url().then((huntUrl) => {
      signOut();
      cy.visit(huntUrl);
      assertHuntDetails({ itemAmount: 4, estimate: "40s", killsPerUnit: 8 });
    });
  });

  it("can not see other users hunts in my own list", () => {
    gotoHuntsPageAsNewUser();
    createHunt();
    signOut();
    gotoHuntsPageAsNewUser();
    findListedHuntTitle(defaultHuntName).should("not.exist");
  });
});

function findListedHuntTitle(huntName: string) {
  return cy.findByRole("heading", { name: ignoreCase(huntName) });
}

function createHunt() {
  cy.findByRole("button", { name: /create new list/i }).click();
}

function viewHunt() {
  cy.findByRole("link", { name: /view list/i }).click();
}

function publishHunt() {
  cy.findByRole("button", { name: /make public/i }).click();
}

function assertHuntDetails({
  itemAmount = 1,
  estimate = "1s",
  killsPerUnit = 1,
}) {
  withinItemGrid(() => {
    expectTableColumn("Item", () => /test item \[3]/i);
    expectTableColumn("Amount", () => itemAmount);
    expectTableColumn("Estimate", () => estimate);
  });

  withinMonsterGrid(() => {
    expectTableColumn("Monster", () => /test monster/i);
    expectTableColumn(/map/i, () => /test_map/i);
    expectTableColumn("Kills per minute", () => killsPerUnit);
  });
}

function createHuntWithDetails({
  itemAmount = 1,
  killsPerUnit = 1,
  publish = false,
} = {}) {
  const name = "test item";
  const nameRegex = ignoreCase(name, { exact: false });

  createHunt();
  waitForPageReady();
  viewHunt();
  waitForPageReady();

  if (publish) {
    publishHunt();
  }

  cy.findByLabelText("Find an item to track").type(name);
  waitForPageReady();
  cy.findByRole("option", { name: nameRegex }).click();
  waitForPageReady();

  cy.get("#ItemAmount").clear().type(`${itemAmount}`);
  waitForPageReady();
  cy.get("#ItemTargets").select(0);
  waitForPageReady();

  cy.get("#KillsPerUnit").clear().type(`${killsPerUnit}`);
  waitForPageReady();
  cy.get("#MonsterSpawn").select(0);
  waitForPageReady();
}

function withinItemGrid(fn: () => void) {
  cy.findByRole("grid", { name: /items/i }).within(fn);
}

function withinMonsterGrid(fn: () => void) {
  cy.findByRole("grid", { name: /monsters/i }).within(fn);
}
