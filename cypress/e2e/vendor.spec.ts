import { range } from "lodash";
import { listVendings } from "../support/actions/nav";
import {
  resetData,
  signInAsAdmin,
  uploadAssets,
} from "../support/actions/admin";
import { expectTableColumn, findTableColumn } from "../support/actions/grid";
import {
  generateSearchPageTests,
  withFilterMenu,
} from "../support/actions/search";
import { compareNumeric, compareStrings } from "../support/util";
import { VendorItem } from "../../src/api/services/vendor/types";
import { waitForPageReady } from "../support/actions/common";
import { testItemIdentifier } from "./item.actions";

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

  listVendings();
});

generateSearchPageTests({
  searches: {
    id: {
      input: () => cy.findByLabelText("Item ID").type("501"),
      verify: () => expectTableColumn("Item", () => /red potion/i),
    },
    name: {
      input: () => cy.findByLabelText("Item name").type("potion"),
      verify: () => expectTableColumn("Item", () => /potion/i),
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
          () => (text) => parseFloat(text) >= 300 && parseFloat(text) <= 600
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
  before(() => {
    const items = [
      mockItem({
        itemId: 1108,
        cardIds: [4209, 4190],
        options: [
          { id: 1, value: 100 },
          { id: 2, value: 50 },
          { id: 10, value: 15 },
        ],
      }),
    ];
    uploadAssets();
    cy.trpc((client) =>
      client?.vendor.insertItems.mutate({
        items,
        charId: 0,
        accountId: 0,
      })
    );
    listVendings();
    withFilterMenu(() => cy.findByLabelText("Item ID").type("1108"));
    waitForPageReady();
  });

  testItemIdentifier(() => findTableColumn("Item").findByRole("link"), {
    name: "Blade",
    slots: 4,
    cards: ["Violy Card", "Wraith Card"],
    enchants: ["Health Points +100", "Spell Points +50", "Movement Speed +15%"],
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
