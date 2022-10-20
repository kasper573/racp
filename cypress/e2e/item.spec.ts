import { gotoItem, listItems } from "../support/actions/nav";
import {
  expectTableColumn,
  findRowById,
  findTableColumn,
} from "../support/actions/grid";
import {
  compareNumeric,
  compareStrings,
  compareThousands,
} from "../support/util";
import { menuSlide } from "../support/actions/common";
import { generateSearchPageTests } from "../support/actions/search";
import { ensureRAthenaFixturesAndAssets } from "../support/actions/admin";
import { testItemId } from "../fixtures/ids";

before(ensureRAthenaFixturesAndAssets);

describe("search", () => {
  before(listItems);
  generateSearchPageTests({
    searches: {
      id: {
        input: (menu) =>
          menu().findByLabelText("ID").type(testItemId.toString()),
        verify: () => findRowById(testItemId),
      },
      name: {
        input: (menu) => menu().findByLabelText("Name").type("test item"),
        verify: () => expectTableColumn("Name", () => /test item/i),
      },
      "primary type": {
        input: (menu) => menu().get(`#PrimaryType`).select("Weapon"),
        verify: () => findTableColumn("Name").contains(/test item/i),
      },
      "sub type": {
        input: (menu) => {
          menu().get(`#PrimaryType`).select("Weapon");
          menu().get("#Subtype").select("1hSword");
        },
        verify: () => findTableColumn("Name").contains(/test item/i),
      },
      class: {
        input: (menu) => menu().get("#Class").select("Fourth"),
        verify: () => findTableColumn("Name").contains(/test item/i),
      },
      job: {
        input: (menu) => menu().get("#Job").select("Alchemist"),
        verify: () => findTableColumn("Name").contains(/test item/i),
      },
      element: {
        input: (menu) => menu().get("#Element").select("Dark"),
        verify: () => findTableColumn("Name").contains(/test item/i),
      },
      status: {
        input: (menu) => menu().get("#Status").select("Bleeding"),
        verify: () => findTableColumn("Name").contains(/test item/i),
      },
      race: {
        input: (menu) => menu().get("#Race").select("Demon"),
        verify: () => findTableColumn("Name").contains(/test item/i),
      },
      description: {
        input: (menu) =>
          menu()
            .findByLabelText("Description contains")
            .type("Identified Description"),
        verify: () => findTableColumn("Name").contains(/test item/i),
      },
      script: {
        input: (menu) =>
          menu().findByLabelText("Script contains").type("bAtkEle"),
        verify: () => findTableColumn("Name").contains(/test item/i),
      },
      slots: {
        input: (menu) => menu().within(() => menuSlide("Slots", [2, 3])),
        verify: () =>
          expectTableColumn("Slots", () => (text) => +text >= 2 && +text <= 2),
      },
      sellPrice: {
        input: (menu) => {
          menu().findByLabelText("Sell Value (min)").type("10000");
          menu().findByLabelText("Sell Value (max)").type("20000");
        },
        verify: () =>
          expectTableColumn(
            "Sell Value",
            () => (text) =>
              parseFloat(text) >= 10000 && parseFloat(text) <= 20000
          ),
      },
    },
    sorts: {
      // Expect name sorting to be done ignoring slots
      Name: (a, b) => compareStrings(trimSlots(a), trimSlots(b)),
      "Sell Value": compareThousands,
      Weight: compareNumeric,
      Atk: compareNumeric,
      MAtk: compareNumeric,
      Def: compareNumeric,
      "Min Level": compareNumeric,
      "Max Level": compareNumeric,
      Slots: compareNumeric,
    },
  });
});

describe("details", () => {
  before(() => gotoItem(testItemId));

  it("can list droppers", () => {
    findTableColumn("Monster").contains(/test monster/i);
  });

  it("can list sellers", () => {
    findTableColumn("Shop").contains(/test merchant/i);
  });
});

describe("assets", () => {
  before(() => gotoItem(testItemId));

  it("exists", () => cy.contains(/test item/i));

  it("has client texts", () => {
    cy.contains("Test Item Identified Display Name");
    cy.contains("Test Item Identified Description");
  });

  it("has image", () => {
    cy.findByRole("img", { name: "Test Item" }).isFixtureImage("test_item.png");
  });
});

const trimSlots = (str: string) => /^(.*?)\s*\[\d+]/.exec(str)?.[1] ?? str;
