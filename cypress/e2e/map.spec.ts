import { gotoMap, listMaps } from "../support/actions/nav";
import {
  expectTableColumn,
  findRowById,
  findTableColumn,
} from "../support/actions/grid";
import { compareStrings } from "../support/util";
import { generateSearchPageTests } from "../support/actions/search";
import { signInAsAdmin, uploadAssets } from "../support/actions/admin";

describe("search", () => {
  before(listMaps);
  generateSearchPageTests({
    searches: {
      id: {
        input: (menu) => menu().findByLabelText("ID").type("prontera"),
        verify: () => findRowById("prontera"),
      },
      name: {
        input: (menu) => menu().findByLabelText("Name").type("prt_"),
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
    findTableColumn("Destination").contains(/prt_maze01/i);
  });

  it("can list monsters", () => {
    cy.findByRole("tab", { name: /monsters/i }).click();
    findTableColumn("Name").contains(/Lunatic Ringleader/i);
  });

  describe("shop list", () => {
    before(() => {
      gotoMap("prontera");
      cy.findByRole("tab", { name: /shops/i }).click();
    });

    it("contains the right shops", () => {
      findTableColumn("Name").contains(/Vendor from Milk Ranch/i);
    });

    it("can show show items", () => {
      cy.findAllByRole("link", { name: /Fruit Gardener/i })
        .first()
        .click();

      findTableColumn("Name").contains(/apple/i);
    });
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
