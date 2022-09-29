import { gotoMap, listMaps } from "../support/actions/nav";
import { findDataCells, findRowById } from "../support/actions/grid";
import { compareStrings } from "../support/util";
import { signInAsAdmin, uploadAssets } from "../support/actions/admin";
import { generateSearchPageTests } from "../support/generateSearchPageTests";

before(() => {
  cy.visit("/");
  signInAsAdmin();
  uploadAssets();
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
        input: () => cy.findByLabelText("Name").type("field"),
        verify: () =>
          findDataCells("Name", (text) => !/field/i.test(text)).should(
            "have.length",
            0
          ),
      },
    },
    sorts: {
      Name: compareStrings,
      id: compareStrings,
    },
  });
});

describe("details", () => {
  it("can list warps", () => {
    gotoMap("prt_fild01");
    cy.findByRole("tab", { name: /warps/i }).click();
    findDataCells("Destination", /prt_fild02/i);
    findDataCells("Destination", /prt_maze01/i);
    findDataCells("Destination", /mjolnir_10/i);
  });

  it("can list monsters", () => {
    gotoMap("prt_fild01");
    cy.findByRole("tab", { name: /monsters/i }).click();
    findDataCells("Name", /lunatic ringleader/i);
    findDataCells("Name", /poring/i);
    findDataCells("Name", /fabre/i);
  });
});
