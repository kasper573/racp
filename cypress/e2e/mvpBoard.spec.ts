import { clickMainMenuItem } from "../support/actions/nav";
import { expectTableColumn, findTableColumn } from "../support/actions/grid";
import { compareNumeric, compareStrings } from "../support/util";
import { generateSearchPageTests } from "../support/actions/search";

before(() => {
  cy.visit("/");
});

describe("search", () => {
  before(() => clickMainMenuItem("mvp board"));
  generateSearchPageTests({
    searches: {
      monsterId: {
        input: () => cy.findByLabelText("Monster ID").type("1038"),
        verify: () => expectTableColumn("Monster", () => /Osiris/i),
      },
      monsterName: {
        input: () => cy.findByLabelText("Monster name").type("dopp"),
        verify: () => expectTableColumn("Monster", () => /dopp/i),
      },
      mapId: {
        input: () => cy.findByLabelText("Map ID").type("prt_maze03"),
        verify: () => expectTableColumn("Monster", () => /baphomet/i),
      },
      mapName: {
        input: () => cy.findByLabelText("Map name").type("fild"),
        verify: () => expectTableColumn("Map", () => /fild/i),
      },
      lifeStatus: {
        input: () => cy.get("#LifeStatus").select("dead"),
        verify: () => findTableColumn("Monster").contains("Osiris"),
      },
      killedBy: {
        input: () => cy.findByLabelText("Killed by").type("admin"),
        verify: () => expectTableColumn("Killer", () => /admin/i),
      },
    },
    sorts: {
      Monster: compareStrings,
      Map: compareStrings,
      "Spawn time": compareNumeric,
      "Spawn window": compareNumeric,
      "Death time": compareNumeric,
      MVP: compareStrings,
      Status: compareStrings,
    },
  });
});
