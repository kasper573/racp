import { gotoMonster, listMonsters } from "../support/actions/nav";
import {
  expectTableColumn,
  findRowById,
  findTableColumn,
} from "../support/actions/grid";
import { menuSlide, waitForPageReady } from "../support/actions/common";
import { compareNumeric, compareStrings } from "../support/util";
import { generateSearchPageTests } from "../support/generateSearchPageTests";
import { signInAsAdmin, uploadAssets } from "../support/actions/admin";

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
        verify: () => expectTableColumn("Name", () => /dopp/i),
      },
      race: {
        input: () => cy.get("#Race").select("Angel"),
        verify: () => findTableColumn("Name").contains("Angeling"),
      },
      element: {
        input: () => cy.get("#Element").select("Earth"),
        verify: () => findTableColumn("Name").contains("Fabre"),
      },
      size: {
        input: () => cy.get("#Size").select("Small"),
        verify: () => findTableColumn("Name").contains("Familiar"),
      },
      level: {
        input: () => menuSlide("Level", [50, 55]),
        verify: () =>
          expectTableColumn(
            "Level",
            () => (text) => +text >= 50 && +text <= 55
          ),
      },
      "move speed": {
        input: () => menuSlide("Move Speed", [100, 200]),
        verify: () =>
          expectTableColumn(
            "Move Speed",
            () => (text) => +text >= 100 && +text <= 200
          ),
      },
      "attack range": {
        input: () => menuSlide("Atk. Range", [5, 10]),
        verify: () =>
          expectTableColumn(
            "Atk. Range",
            () => (text) => +text >= 5 && +text <= 10
          ),
      },
      "skill range": {
        input: () => menuSlide("Skill Range", [4, 8]),
        verify: () =>
          expectTableColumn(
            "Skill Range",
            () => (text) => +text >= 4 && +text <= 8
          ),
      },
      "chase range": {
        input: () => menuSlide("Chase Range", [6, 13]),
        verify: () =>
          expectTableColumn(
            "Chase Range",
            () => (text) => +text >= 6 && +text <= 13
          ),
      },
      "base xp": {
        input: () => {
          cy.findByLabelText("Base XP (min)").type("5000");
          cy.findByLabelText("Base XP (max)").type("6000");
        },
        verify: () =>
          expectTableColumn(
            "Base XP",
            () => (text) => +text >= 5000 && +text <= 6000
          ),
      },
      "job xp": {
        input: () => {
          cy.findByLabelText("Job XP (min)").type("5000");
          cy.findByLabelText("Job XP (max)").type("6000");
        },
        verify: () =>
          expectTableColumn(
            "Job XP",
            () => (text) => +text >= 5000 && +text <= 6000
          ),
      },
      modes: {
        input: () => cy.get("#Modes").select("CastSensorChase"),
        verify: () => findTableColumn("Name").contains(/Archer Guardian/i),
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
    waitForPageReady();
    findTableColumn("Map").contains(/xmas_dun01/i);
    findTableColumn("Map").contains(/prt_maze01/i);
    findTableColumn("Map").contains(/sec_in02/i);
  });

  it("can list drops", () => {
    cy.findByRole("tab", { name: /drops/i }).click();
    waitForPageReady();
    findTableColumn("Name").contains(/jellopy/i);
    findTableColumn("Name").contains(/knife/i);
    findTableColumn("Name").contains(/sticky mucus/i);
  });
});

describe("assets", () => {
  before(() => {
    signInAsAdmin();
    uploadAssets();
    gotoMonster(1002);
  });

  it("exists", () => cy.contains("Poring"));

  it("has image", () => {
    cy.findByRole("img", { name: "Poring" }).isFixtureImage("poring.png");
  });
});
