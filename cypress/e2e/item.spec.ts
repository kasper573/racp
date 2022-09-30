import { gotoItem, listItems } from "../support/actions/nav";
import { findDataCells, findRowById } from "../support/actions/grid";
import { compareNumeric, compareStrings } from "../support/util";
import { menuSlide } from "../support/actions/common";
import { signInAsAdmin, uploadAssets } from "../support/actions/admin";
import { generateSearchPageTests } from "../support/generateSearchPageTests";

// Some searches require assets to function
before(() => {
  cy.visit("/");
  signInAsAdmin();
  uploadAssets();
});

describe("search", () => {
  before(listItems);
  generateSearchPageTests({
    searches: {
      id: {
        input: () => cy.findByLabelText("ID").type("501"),
        verify: () => findRowById(501),
      },
      name: {
        input: () => cy.findByLabelText("Name").type("potion"),
        verify: () =>
          findDataCells("Name", (text) => !/potion/i.test(text)).should(
            "have.length",
            0
          ),
      },
      "primary type": {
        input: () => cy.get(`[id="Primary Type"]`).select("Weapon"),
        verify: () => findDataCells("Name", "Sword"),
      },
      "sub type": {
        input: () => {
          cy.get(`[id="Primary Type"]`).select("Weapon");
          cy.get("#Subtype").select("Katar");
        },
        verify: () => findDataCells("Name", "Jur"),
      },
      class: {
        input: () => cy.get("#Class").select("Third"),
        verify: () => findDataCells("Name", "Witch's Staff"),
      },
      job: {
        input: () => cy.get("#Job").select("Summoner"),
        verify: () => findDataCells("Name", /Foxtail/i),
      },
      element: {
        input: () => cy.get("#Element").select("Dark"),
        verify: () => findDataCells("Name", "Shadow Armor Scroll"),
      },
      status: {
        input: () => cy.get("#Status").select("Bleeding"),
        verify: () => findDataCells("Name", "Muscle Cutter"),
      },
      race: {
        input: () => cy.get("#Race").select("Angel"),
        verify: () => findDataCells("Name", "Royal Knuckle"),
      },
      description: {
        input: () =>
          cy
            .findByLabelText("Description contains")
            .type("Identified Description"),
        verify: () => findDataCells("Name", "Red Potion"),
      },
      script: {
        input: () => cy.findByLabelText("Script contains").type("getrefine()"),
        verify: () => findDataCells("Name", "Death Guidance"),
      },
      slots: {
        input: () => menuSlide("Slots", [2, 3]),
        verify: () =>
          findDataCells("Slots", (text) => +text >= 2 && +text <= 2),
      },
    },
    sorts: {
      Name: compareStrings,
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
});

describe("details", () => {
  before(() => gotoItem(505));

  it("can list droppers", () => {
    findDataCells("Name", "Doppelganger");
    findDataCells("Name", "Nightmare");
    findDataCells("Name", "Dark Priest");
  });
});
