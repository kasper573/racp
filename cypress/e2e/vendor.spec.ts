import { clickMainMenuItem } from "../support/actions/nav";
import { resetData, signInAsAdmin } from "../support/actions/admin";
import { expectTableData } from "../support/actions/grid";

beforeEach(() => {
  resetData();
  cy.visit("/");
  signInAsAdmin();
});

it("can list vendor items", () => {
  cy.trpc((client) =>
    client?.vendor.insertItems.mutate({
      items: [
        {
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
        },
      ],
      cartId: 1,
      charId: 1,
      accountId: 1,
    })
  );
  clickMainMenuItem("Vendor");
  expectTableData([
    ["+4 Red Potion", "777z", "2", "Title", "prontera (123, 321)"],
  ]);
});
