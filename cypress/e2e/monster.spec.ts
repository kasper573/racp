import { gotoMonster, listMonsters } from "../support/actions/nav";
import {
  expectTableColumn,
  findRowById,
  findTableColumn,
} from "../support/actions/grid";
import { menuSlide } from "../support/actions/common";
import { compareNumeric, compareStrings } from "../support/util";
import { generateSearchPageTests } from "../support/actions/search";
import { signInAsAdmin, uploadAssets } from "../support/actions/admin";

before(() => {
  cy.visit("/");
});

describe("search", () => {
  before(listMonsters);
  generateSearchPageTests({
    searches: {
      id: {
        input: (menu) => menu().findByLabelText("ID").type("1309"),
        verify: () => findRowById(1309),
      },
      name: {
        input: (menu) => menu().findByLabelText("Name").type("dopp"),
        verify: () => expectTableColumn("Name", () => /dopp/i),
      },
      race: {
        input: (menu) => menu().get("#Race").select("Angel"),
        verify: () => findTableColumn("Name").contains("Angeling"),
      },
      element: {
        input: (menu) => menu().get("#Element").select("Earth"),
        verify: () => findTableColumn("Name").contains("Fabre"),
      },
      size: {
        input: (menu) => menu().get("#Size").select("Small"),
        verify: () => findTableColumn("Name").contains("Familiar"),
      },
      level: {
        input: (menu) => menu().within(() => menuSlide("Level", [50, 55])),
        verify: () =>
          expectTableColumn(
            "Level",
            () => (text) => +text >= 50 && +text <= 55
          ),
      },
      "move speed": {
        input: (menu) =>
          menu().within(() => menuSlide("Move Speed", [100, 200])),
        verify: () =>
          expectTableColumn(
            "Move Speed",
            () => (text) => +text >= 100 && +text <= 200
          ),
      },
      "attack range": {
        input: (menu) => menu().within(() => menuSlide("Atk. Range", [5, 10])),
        verify: () =>
          expectTableColumn(
            "Atk. Range",
            () => (text) => +text >= 5 && +text <= 10
          ),
      },
      "skill range": {
        input: (menu) => menu().within(() => menuSlide("Skill Range", [4, 8])),
        verify: () =>
          expectTableColumn(
            "Skill Range",
            () => (text) => +text >= 4 && +text <= 8
          ),
      },
      "chase range": {
        input: (menu) => menu().within(() => menuSlide("Chase Range", [6, 13])),
        verify: () =>
          expectTableColumn(
            "Chase Range",
            () => (text) => +text >= 6 && +text <= 13
          ),
      },
      "base xp": {
        input: (menu) => {
          menu().findByLabelText("Base XP (min)").type("5000");
          menu().findByLabelText("Base XP (max)").type("6000");
        },
        verify: () =>
          expectTableColumn(
            "Base XP",
            () => (text) => +text >= 5000 && +text <= 6000
          ),
      },
      "job xp": {
        input: (menu) => {
          menu().findByLabelText("Job XP (min)").type("5000");
          menu().findByLabelText("Job XP (max)").type("6000");
        },
        verify: () =>
          expectTableColumn(
            "Job XP",
            () => (text) => +text >= 5000 && +text <= 6000
          ),
      },
      modes: {
        input: (menu) => menu().get("#Modes").select("RandomTarget"),
        verify: () => findTableColumn("Name").contains(/cecil damon/i),
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
    findTableColumn("Map").contains(/xmas_dun01/i);
  });

  it("can list drops", () => {
    cy.findByRole("tab", { name: /drops/i }).click();
    findTableColumn("Name").contains(/Jellopy/i);
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
