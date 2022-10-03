import { clickMainMenuItem } from "../support/actions/nav";
import { signInAsAdmin } from "../support/actions/admin";
import { VendorItem } from "../../src/api/services/vendor/types";
import { expectTableData } from "../support/actions/grid";

let item = mockVendorItem();

before(() => {
  cy.visit("/");
  signInAsAdmin();
  cy.trpc((client) =>
    client?.vendor.insertItems.mutate({
      items: [item],
      cartId: 1,
      charId: 1,
      accountId: 1,
    })
  );
});

it("can list vendors", () => {
  clickMainMenuItem("Vendor");
  expectTableData([
    ["+4 Red Potion", "777z", "2", "Title", "prontera (123, 321)"],
  ]);
});

function mockVendorItem(): VendorItem {
  return {
    id: "1_1",
    price: 777,
    amount: 2,
    refine: 4,
    itemId: 501,
    vendorId: 1,
    vendorTitle: "Title",
    identified: true,
    map: "prontera",
    options: [],
    cardIds: [],
    name: "Red Potion",
    x: 123,
    y: 321,
  };
}
