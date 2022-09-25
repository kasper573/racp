import { listMaps } from "../support/actions/nav";
import { findDataCells, findRowById } from "../support/actions/grid";
import { compareStrings } from "../support/util";
import { signInAsAdmin, uploadAssets } from "../support/actions/admin";
import { generateSearchPageTests } from "../support/generateSearchPageTests";

// Some searches require assets to function
before(() => {
  cy.visit("/");
  signInAsAdmin();
  uploadAssets();
  listMaps();
});

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
