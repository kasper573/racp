import { gotoMap, listMaps } from "../support/actions/nav";
import {
  expectTableColumn,
  findRowById,
  findTableColumn,
} from "../support/actions/grid";
import { compareStrings } from "../support/util";
import { generateSearchPageTests } from "../support/actions/search";
import { ensureRAthenaFixturesAndAssets } from "../support/actions/admin";

before(ensureRAthenaFixturesAndAssets);

describe("search", () => {
  before(listMaps);
  generateSearchPageTests({
    searches: {
      id: {
        input: (menu) => menu().findByLabelText("ID").type("test_map"),
        verify: () => findRowById("test_map"),
      },
      name: {
        input: (menu) => menu().findByLabelText("Name").type("test map"),
        verify: () => expectTableColumn("Name", () => /test map/i),
      },
    },
    sorts: {
      Name: compareStrings,
      id: compareStrings,
    },
  });
});

describe("details", () => {
  before(() => gotoMap("test_map"));

  it("can list warps", () => {
    cy.findByRole("tab", { name: /warps/i }).click();
    findTableColumn("Destination").contains(/test_map2/i);
  });

  it("can list monsters", () => {
    cy.findByRole("tab", { name: /monsters/i }).click();
    findTableColumn("Name").contains(/Test Monster/i);
  });

  it("can list npcs", () => {
    cy.findByRole("tab", { name: /npcs/i }).click();
    findTableColumn("Name").contains(/Test Npc/i);
  });

  describe("shop list", () => {
    before(() => {
      gotoMap("test_map");
      cy.findByRole("tab", { name: /shops/i }).click();
    });

    it("contains the right shops", () => {
      findTableColumn("Name").contains(/Test Merchant/i);
    });

    it("can show show items", () => {
      cy.findAllByRole("link", { name: /Test Merchant/i })
        .first()
        .click();

      findTableColumn("Name").contains(/Test Item/i);
    });
  });
});

describe("assets", () => {
  before(() => gotoMap("test_map"));

  it("exists", () => cy.contains("Test Map"));

  it("has pins", () => {
    cy.findAllByTestId("Map pin").should("exist");
  });

  it("has image", () => {
    cy.findByRole("img", { name: "Map" }).isFixtureImage("test_map.png");
  });
});
