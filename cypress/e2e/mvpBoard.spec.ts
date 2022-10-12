import { gotoMainMenuPage } from "../support/actions/nav";
import { expectTableColumn, findTableColumn } from "../support/actions/grid";
import { compareNumeric, compareStrings } from "../support/util";
import { generateSearchPageTests } from "../support/actions/search";
import { resetData, signInAsAdmin } from "../support/actions/admin";
import { adminCharId, adminCharName } from "../support/vars";

before(() => {
  resetData();
  cy.visit("/");
  signInAsAdmin();

  cy.trpc((client) =>
    client?.monster.insertMvps.mutate([
      {
        map: "moc_pryd04",
        monster_id: 1038, // Osiris
        kill_char_id: adminCharId, // admin
      },
    ])
  );

  gotoMainMenuPage("Mvps");
});

describe("search", () => {
  generateSearchPageTests({
    searches: {
      monsterId: {
        input: (menu) => menu().findByLabelText("Monster ID").type("1038"),
        verify: () => expectTableColumn("Monster", () => /Osiris/i),
      },
      monsterName: {
        input: (menu) => menu().findByLabelText("Monster name").type("dopp"),
        verify: () => expectTableColumn("Monster", () => /dopp/i),
      },
      mapId: {
        input: (menu) => menu().findByLabelText("Map ID").type("prt_maze03"),
        verify: () => expectTableColumn("Monster", () => /baphomet/i),
      },
      mapName: {
        input: (menu) => menu().findByLabelText("Map name").type("fild"),
        verify: () => expectTableColumn("Map", () => /fild/i),
      },
      status: {
        input: (menu) => menu().get("#Status").select("Dead"),
        verify: () => findTableColumn("Monster").contains("Osiris"),
      },
      killedBy: {
        input: (menu) => menu().findByLabelText("MVP").type(adminCharName),
        verify: () => expectTableColumn("MVP", () => adminCharName),
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
