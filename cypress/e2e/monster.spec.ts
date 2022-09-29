import { gotoMonster, listMonsters } from "../support/actions/nav";
import { findDataCells, findRowById } from "../support/actions/grid";
import { menuSlide } from "../support/actions/common";
import { compareNumeric, compareStrings } from "../support/util";
import { generateSearchPageTests } from "../support/generateSearchPageTests";

before(() => {
  cy.visit("/");
});

describe("search", () => {
  before(listMonsters);
  generateSearchPageTests({
    searches: {
      id: {
        input: () => cy.findByLabelText("ID").type("1309"),
        verify: () => findRowById(1309),
      },
      name: {
        input: () => cy.findByLabelText("Name").type("dopp"),
        verify: () =>
          findDataCells("Name", (text) => !/dopp/i.test(text)).should(
            "have.length",
            0
          ),
      },
      race: {
        input: () => cy.get("#Race").select("Angel"),
        verify: () => findDataCells("Name", "Angeling"),
      },
      element: {
        input: () => cy.get("#Element").select("Earth"),
        verify: () => findDataCells("Name", "Fabre"),
      },
      size: {
        input: () => cy.get("#Size").select("Small"),
        verify: () => findDataCells("Name", "Familiar"),
      },
      level: {
        input: () => menuSlide("Level", [50, 55]),
        verify: () =>
          findDataCells("Level", (text) => +text >= 50 && +text <= 55),
      },
      "move speed": {
        input: () => menuSlide("Move Speed", [100, 200]),
        verify: () =>
          findDataCells("Move Speed", (text) => +text >= 100 && +text <= 200),
      },
      "attack range": {
        input: () => menuSlide("Atk. Range", [5, 10]),
        verify: () =>
          findDataCells("Atk. Range", (text) => +text >= 5 && +text <= 10),
      },
      "skill range": {
        input: () => menuSlide("Skill Range", [4, 8]),
        verify: () =>
          findDataCells("Skill Range", (text) => +text >= 4 && +text <= 8),
      },
      "chase range": {
        input: () => menuSlide("Chase Range", [6, 13]),
        verify: () =>
          findDataCells("Chase Range", (text) => +text >= 6 && +text <= 13),
      },
      "base xp": {
        input: () => {
          cy.findByLabelText("Base XP (min)").type("5000");
          cy.findByLabelText("Base XP (max)").type("6000");
        },
        verify: () =>
          findDataCells("Base XP", (text) => +text >= 5000 && +text <= 6000),
      },
      "job xp": {
        input: () => {
          cy.findByLabelText("Job XP (min)").type("5000");
          cy.findByLabelText("Job XP (max)").type("6000");
        },
        verify: () =>
          findDataCells("Job XP", (text) => +text >= 5000 && +text <= 6000),
      },
      modes: {
        input: () => cy.get("#Modes").select("CastSensorChase"),
        verify: () => findDataCells("Name", /Archer Guardian/i),
      },
    },
    sorts: {
      Name: compareStrings,
      Level: compareNumeric,
      Attack: compareNumeric,
      "M. Attack": compareNumeric,
      Defense: compareNumeric,
      "M. Defense": compareNumeric,
      Hit: compareNumeric,
      Flee: compareNumeric,
      "Base XP": compareNumeric,
      "Job XP": compareNumeric,
      "Move Speed": compareNumeric,
      "Atk. Range": compareNumeric,
      "Skill Range": compareNumeric,
      "Chase Range": compareNumeric,
    },
  });
});

describe("details", () => {
  before(() => gotoMonster(1002));

  it("can list spawns", () => {
    cy.findByRole("tab", { name: /spawns/i }).click();
    findDataCells("Map", /gef_fild00/i);
    findDataCells("Map", /pay_fild04/i);
    findDataCells("Map", /xmas_dun01/i);
  });

  it("can list drops", () => {
    cy.findByRole("tab", { name: /drops/i }).click();
    findDataCells("Name", /jellopy/i);
    findDataCells("Name", /knife/i);
    findDataCells("Name", /sticky mucus/i);
  });
});
