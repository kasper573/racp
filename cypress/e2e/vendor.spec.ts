import { range } from "lodash";
import { listVendings } from "../support/actions/nav";

import { expectTableColumn, findTableColumn } from "../support/actions/grid";
import {
  generateSearchPageTests,
  withFilterMenu,
} from "../support/actions/search";
import {
  compareNumeric,
  compareStrings,
  compareThousands,
} from "../support/util";
import { VendorItem } from "../../src/api/services/vendor/types";
import { waitForPageReady } from "../support/actions/common";
import { testItemId, testMapId } from "../fixtures/ids";
import { ensureAssets, resetData } from "../support/actions/admin";
import { testItemIdentifier } from "./item.actions";

before(() => {
  resetData();

  ensureAssets();

  cy.trpc((client) =>
    client?.vendor.insertItems.mutate({
      items: [
        ...range(0, 50).map(() => mockItem()),
        mockItem({
          itemId: testItemId,
          cardIds: [testItemId],
          refine: 1,
          options: [
            // These item options exist in the data.grf fixture
            { id: 1, value: 100 },
            { id: 2, value: 50 },
            { id: 10, value: 15 },
          ],
        }),
      ],
      charId: 0,
      accountId: 0,
    })
  );

  listVendings();
});

generateSearchPageTests({
  searches: {
    id: {
      input: (menu) =>
        menu().findByLabelText("Item ID").type(testItemId.toString()),
      verify: () => expectTableColumn("Item", () => /test item/i),
    },
    name: {
      input: (menu) => menu().findByLabelText("Item name").type("test"),
      verify: () => expectTableColumn("Item", () => /test/i),
    },
    vendor: {
      input: (menu) => menu().findByLabelText("Vendor").type("Vendor 4"),
      verify: () => expectTableColumn("Vendor", () => /vendor 4/i),
    },
    price: {
      input: (menu) => {
        menu().findByLabelText("Price (min)").type("300");
        menu().findByLabelText("Price (max)").type("600");
      },
      verify: () =>
        expectTableColumn(
          "Price",
          () => (text) => parseFloat(text) >= 300 && parseFloat(text) <= 600
        ),
    },
    amount: {
      input: (menu) => {
        menu().findByLabelText("Amount (min)").type("3");
        menu().findByLabelText("Amount (max)").type("6");
      },
      verify: () =>
        expectTableColumn("Amount", () => (text) => +text >= 3 && +text <= 6),
    },
  },
  sorts: {
    Price: compareThousands,
    Amount: compareNumeric,
    Vendor: compareStrings,
  },
});

describe("assets", () => {
  before(() => {
    withFilterMenu(() =>
      cy.findByLabelText("Item ID").type(testItemId.toString())
    );
    waitForPageReady();
  });

  testItemIdentifier(() => findTableColumn("Item").findByRole("link"), {
    name: "Test Item",
    slots: 3,
    refine: 1,
    cards: ["Test Item"],
    enchants: ["Health Points +100", "Spell Points +50", "Movement Speed +15%"],
  });
});

let seed = 0;
function mockItem(props: Partial<VendorItem> = {}) {
  seed++;
  return {
    id: `${seed}_${seed}`,
    price: seed * 100,
    amount: seed % 10,
    refine: seed % 10,
    vendorId: seed,
    vendorTitle: `Vendor ${seed}`,
    identified: seed % 2 === 0,
    map: testMapId,
    options: [],
    cardIds: [],
    name: "",
    x: seed,
    y: seed,

    // Slight dependency on rAthena structure, but it's so minor it's okay.
    // rAthena item ids start at 500 and goes up. It's extremely unlikely this will change.
    itemId: 500 + seed,

    ...props,
  };
}
