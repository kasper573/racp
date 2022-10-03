import { range } from "lodash";
import { clickMainMenuItem } from "../support/actions/nav";
import { resetData, signInAsAdmin } from "../support/actions/admin";
import { expectTableColumn } from "../support/actions/grid";
import { generateSearchPageTests } from "../support/generateSearchPageTests";
import { compareNumeric, compareStrings } from "../support/util";
import { VendorItem } from "../../src/api/services/vendor/types";

before(() => {
  resetData();
  cy.visit("/");
  signInAsAdmin();

  cy.trpc((client) =>
    client?.vendor.insertItems.mutate({
      items: range(0, 50).map(() => mockItem()),
      charId: 0,
      accountId: 0,
    })
  );

  clickMainMenuItem("Vendors");
});

generateSearchPageTests({
  searches: {
    id: {
      input: () => cy.findByLabelText("Item ID").type("501"),
      verify: () => expectTableColumn("Item", () => /red potion/i),
    },
    vendor: {
      input: () => cy.findByLabelText("Vendor").type("4"),
      verify: () => expectTableColumn("Vendor", () => /4/i),
    },
    price: {
      input: () => {
        cy.findByLabelText("Price (min)").type("300");
        cy.findByLabelText("Price (max)").type("600");
      },
      verify: () =>
        expectTableColumn(
          "Price",
          () => (text) => +text >= 300 && +text <= 600
        ),
    },
    amount: {
      input: () => {
        cy.findByLabelText("Amount (min)").type("3");
        cy.findByLabelText("Amount (max)").type("6");
      },
      verify: () =>
        expectTableColumn("Amount", () => (text) => +text >= 3 && +text <= 6),
    },
  },
  sorts: {
    Price: compareNumeric,
    Amount: compareNumeric,
    Vendor: compareStrings,
  },
});

describe("assets", () => {
  it("has correct card prefix/suffix", () => {
    const viola = 4209;
    const wraith = 4190;
    const itemId = 2501; // Hood
    // prettier-ignore
    const items = [
      mockItem({ itemId, cardIds: [viola, wraith] }),
      mockItem({ itemId, cardIds: [...new Array(2).fill(viola), ...new Array(2).fill(wraith)], }),
      mockItem({ itemId, cardIds: [...new Array(3).fill(viola), ...new Array(1).fill(wraith)], }),
      mockItem({ itemId, cardIds: [...new Array(4).fill(viola)], }),
      mockItem({ itemId, cardIds: [viola, ...new Array(3).fill(wraith)], }),
      mockItem({ itemId, cardIds: new Array(4).fill(wraith), }),
    ];
    cy.trpc((client) =>
      client?.vendor.insertItems.mutate({
        items,
        charId: 0,
        accountId: 0,
      })
    );
    cy.reload();
    cy.findByLabelText("Item ID").type(`${itemId}`);
    expectTableColumn(
      "Item",
      (rowIndex) =>
        ({
          0: "Fiddler's Hood of Last Laugh",
          1: "Double Fiddler's Hood of Double Last Laugh",
          2: "Triple Fiddler's Hood of Last Laugh",
          3: "Quadruple Fiddler's Hood",
          4: "Fiddler's Hood of Triple Last Laugh",
          5: "Hood of Quadruple Last Laugh",
        }[rowIndex])
    );
  });

  it("has correct card enchants", () => {
    expect(true).to.equal(false);
  });
});

let idCounter = 0;
function mockItem(props: Partial<VendorItem> = {}) {
  let seed = idCounter++;
  return {
    id: `${seed}_${seed}`,
    price: seed * 100,
    amount: seed % 10,
    refine: seed % 10,
    itemId: 501 + seed,
    vendorId: seed,
    vendorTitle: `Title ${seed}`,
    identified: seed % 2 === 0,
    map: "prontera",
    options: [],
    cardIds: [],
    name: "",
    x: seed,
    y: seed,
    ...props,
  };
}
