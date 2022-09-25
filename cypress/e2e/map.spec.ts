import { listMaps } from "../support/actions/nav";
import {
  findDataCells,
  findDataRows,
  findRowById,
} from "../support/actions/grid";
import { createTextCompareFn, generateSearchPageTests } from "../support/util";
import { signInAsAdmin, uploadAssets } from "../support/actions/admin";

// Some searches require assets to function
before(() => {
  cy.visit("/");
  signInAsAdmin();
  uploadAssets();
});

generateSearchPageTests({
  gotoPage: listMaps,
  searches: {
    id: {
      input: () => cy.findByLabelText("ID").type("prontera"),
      verify: () => findRowById("prontera"),
    },
    name: {
      input: () => cy.findByLabelText("Name").type("field"),
      verify: () =>
        findDataRows()
          .its("length")
          .then((length) => {
            expect(length).to.be.greaterThan(0, "No maps found");
            findDataCells("Name", /field/i).should("have.length", length);
          }),
    },
  },
  sorts: {
    Name: createTextCompareFn(),
    id: createTextCompareFn(),
  },
});
