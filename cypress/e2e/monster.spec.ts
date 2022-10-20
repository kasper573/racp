import { gotoMonster, listMonsters } from "../support/actions/nav";
import {
  expectTableColumn,
  findRowById,
  findTableColumn,
} from "../support/actions/grid";
import { menuSlide } from "../support/actions/common";
import { compareNumeric, compareStrings } from "../support/util";
import { generateSearchPageTests } from "../support/actions/search";
import { ensureAssets } from "../support/actions/admin";
import { testMonsterId } from "../fixtures/ids";

before(ensureAssets);

describe("search", () => {
  before(listMonsters);
  generateSearchPageTests({
    searches: {
      id: {
        input: (menu) => menu().findByLabelText("ID").type(`${testMonsterId}`),
        verify: () => findRowById(testMonsterId),
      },
      name: {
        input: (menu) => menu().findByLabelText("Name").type("test monster"),
        verify: () => expectTableColumn("Name", () => /test monster/i),
      },
      race: {
        input: (menu) => {
          menu().findByLabelText("ID").type(`${testMonsterId}`);
          menu().get("#Race").select("Plant");
        },
        verify: () => findTableColumn("Name").contains(/test monster/i),
      },
      element: {
        input: (menu) => {
          menu().findByLabelText("ID").type(`${testMonsterId}`);
          menu().get("#Element").select("Water");
        },
        verify: () => findTableColumn("Name").contains(/test monster/i),
      },
      size: {
        input: (menu) => {
          menu().findByLabelText("ID").type(`${testMonsterId}`);
          menu().get("#Size").select("Medium");
        },
        verify: () => findTableColumn("Name").contains(/test monster/i),
      },
      level: {
        input: (menu) => menu().within(() => menuSlide("Level", [10, 20])),
        verify: () =>
          expectTableColumn(
            "Level",
            () => (text) => +text >= 10 && +text <= 20
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
        input: (menu) => {
          menu().findByLabelText("ID").type(`${testMonsterId}`);
          menu().get("#Modes").select("Looter");
        },
        verify: () => findTableColumn("Name").contains(/test monster/i),
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
  before(() => gotoMonster(testMonsterId));

  it("can list spawns", () => {
    cy.findByRole("tab", { name: /spawns/i }).click();
    findTableColumn("Map").contains(/test_map/i);
  });

  it("can list drops", () => {
    cy.findByRole("tab", { name: /drops/i }).click();
    findTableColumn("Name").contains(/test item/i);
  });
});

describe("assets", () => {
  before(() => gotoMonster(testMonsterId));

  it("exists", () => cy.contains("Test Monster"));

  it("has image", () => {
    cy.findByRole("img", { name: "Test Monster" }).isFixtureImage(
      "test_monster.png"
    );
  });
});
