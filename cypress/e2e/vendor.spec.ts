import { range } from "lodash";
import { clickMainMenuItem } from "../support/actions/nav";
import { resetData, signInAsAdmin } from "../support/actions/admin";
import { expectTableColumn } from "../support/actions/grid";
import { generateSearchPageTests } from "../support/generateSearchPageTests";
import { waitForPageReady } from "../support/actions/common";
import { compareNumeric, compareStrings } from "../support/util";

before(() => {
  resetData();
  cy.visit("/");
  signInAsAdmin();
});

describe("search", () => {
  before(() => {
    cy.trpc((client) =>
      client?.vendor.insertItems.mutate({
        items: range(0, 50).map(() => mockVendorItem()),
        charId: 0,
        accountId: 0,
      })
    );
    clickMainMenuItem("Vendor");
    waitForPageReady();
  });

  generateSearchPageTests({
    searches: {
      id: {
        input: () => cy.findByLabelText("ID").type("501"),
        verify: () => expectTableColumn("Name", () => /red potion/i),
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
});

let idCounter = 0;
function mockVendorItem(seed = idCounter++) {
  return {
    id: `${seed}_${seed}`,
    price: seed * 100,
    amount: seed,
    refine: seed,
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
  };
}
