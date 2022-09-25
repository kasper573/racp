import { listItems } from "../support/actions/nav";
import {
  findDataCells,
  findDataRows,
  findRowById,
} from "../support/actions/grid";
import {
  compareNumeric,
  createTextCompareFn,
  generateSearchPageTests,
} from "../support/util";

generateSearchPageTests({
  gotoPage: listItems,
  searches: {
    id: {
      input: () => cy.findByLabelText("ID").type("501"),
      verify: () => findRowById(501),
    },
    name: {
      input: () => cy.findByLabelText("Name").type("potion"),
      verify: () =>
        findDataRows()
          .its("length")
          .then((length) => {
            expect(length).to.be.greaterThan(0, "No items found");
            findDataCells("Name", /potion/i).should("have.length", length);
          }),
    },
  },
  sorts: {
    Name: createTextCompareFn(),
    Buy: compareNumeric,
    Sell: compareNumeric,
    Weight: compareNumeric,
    Atk: compareNumeric,
    MAtk: compareNumeric,
    Def: compareNumeric,
    "Min Level": compareNumeric,
    "Max Level": compareNumeric,
    Slots: compareNumeric,
  },
});
