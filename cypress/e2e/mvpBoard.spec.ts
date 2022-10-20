import { gotoMainMenuPage } from "../support/actions/nav";
import { expectTableColumn, findTableColumn } from "../support/actions/grid";
import { compareNumeric, compareStrings } from "../support/util";
import { generateSearchPageTests } from "../support/actions/search";
import {
  ensureRAthenaFixturesAndAssets,
  resetData,
} from "../support/actions/admin";
import { adminCharId, adminCharName } from "../support/vars";
import { testMapId, testMonsterId } from "../fixtures/ids";

before(() => {
  resetData();
  ensureRAthenaFixturesAndAssets();

  cy.trpc((client) =>
    client?.monster.insertMvps.mutate([
      {
        map: testMapId,
        monster_id: testMonsterId,
        kill_char_id: adminCharId,
      },
    ])
  );

  gotoMainMenuPage("Mvps");
});

describe("search", () => {
  generateSearchPageTests({
    searches: {
      monsterId: {
        input: (menu) =>
          menu().findByLabelText("Monster ID").type(testMonsterId.toString()),
        verify: () => expectTableColumn("Monster", () => /test monster/i),
      },
      monsterName: {
        input: (menu) => menu().findByLabelText("Monster name").type("test"),
        verify: () => expectTableColumn("Monster", () => /test monster/i),
      },
      mapId: {
        input: (menu) => menu().findByLabelText("Map ID").type(testMapId),
        verify: () => expectTableColumn("Monster", () => /test monster/i),
      },
      mapName: {
        input: (menu) => menu().findByLabelText("Map name").type("test"),
        verify: () => expectTableColumn("Map", () => /test/i),
      },
      status: {
        input: (menu) => menu().get("#Status").select("Dead"),
        verify: () => findTableColumn("Monster").contains(/test monster/i),
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
