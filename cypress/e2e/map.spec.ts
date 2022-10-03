import { gotoMap, listMaps } from "../support/actions/nav";
import {
  expectTableColumn,
  findRowById,
  findTableColumn,
} from "../support/actions/grid";
import { compareStrings } from "../support/util";
import { generateSearchPageTests } from "../support/generateSearchPageTests";
import { waitForPageReady } from "../support/actions/common";
import { signInAsAdmin, uploadAssets } from "../support/actions/admin";

before(() => {
  cy.visit("/");
});

describe("search", () => {
  before(listMaps);
  generateSearchPageTests({
    searches: {
      id: {
        input: () => cy.findByLabelText("ID").type("prontera"),
        verify: () => findRowById("prontera"),
      },
      name: {
        input: () => cy.findByLabelText("Name").type("prt_"),
        verify: () => expectTableColumn("Name", () => /prt_/i),
      },
    },
    sorts: {
      Name: compareStrings,
      id: compareStrings,
    },
  });
});

describe("details", () => {
  before(() => gotoMap("prt_fild01"));

  it("can list warps", () => {
    cy.findByRole("tab", { name: /warps/i }).click();
    waitForPageReady();
    findTableColumn("Destination").contains(/prt_maze01/i);
    findTableColumn("Destination").contains(/prt_gld/i);
    findTableColumn("Destination").contains(/mjolnir_10/i);
  });

  it("can list monsters", () => {
    cy.findByRole("tab", { name: /monsters/i }).click();
    waitForPageReady();
    findTableColumn("Name").contains(/lunatic ringleader/i);
    findTableColumn("Name").contains(/poring/i);
    findTableColumn("Name").contains(/fabre/i);
  });
});

describe("assets", () => {
  before(() => {
    signInAsAdmin();
    uploadAssets();
    gotoMap("prontera");
  });

  it("exists", () => cy.contains("Prontera"));

  it("has pins", () => {
    cy.findAllByTestId("Map pin").should("exist");
  });

  it("has image", () => {
    cy.findByRole("img", { name: "Map" }).isFixtureImage("prontera.png");
  });
});
