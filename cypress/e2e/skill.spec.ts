import { gotoSkill, listSkills } from "../support/actions/nav";
import { expectTableColumn, findRowById } from "../support/actions/grid";
import { compareStrings } from "../support/util";
import { generateSearchPageTests } from "../support/actions/search";
import { testSkillId } from "../fixtures/ids";

describe("search", () => {
  before(listSkills);
  generateSearchPageTests({
    searches: {
      id: {
        input: (menu) => menu().findByLabelText("ID").type(`${testSkillId}`),
        verify: () => findRowById(testSkillId),
      },
      name: {
        input: (menu) => menu().findByLabelText("Name").type("test skill"),
        verify: () => expectTableColumn("Name", () => /test skill/i),
      },
    },
    sorts: {
      Name: compareStrings,
    },
  });
});

describe("details", () => {
  before(() => gotoSkill(testSkillId));

  it("exist", () => {
    cy.findByRole("heading", { name: /Test Skill/i }).should("exist");
  });
});
