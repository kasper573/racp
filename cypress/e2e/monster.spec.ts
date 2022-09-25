import {
  countRows,
  findRowById,
  findRowsByField,
  listMonsters,
} from "../support/actions";

beforeEach(() => {
  cy.visit("/");
  listMonsters();
});

it(`can search for monsters by id`, () => {
  cy.findByLabelText("ID").type("1002");
  cy.waitForNetworkIdle(1000);
  findRowById(1002);
});

it(`can search for monsters by name`, () => {
  cy.findByLabelText("Name").type("scorp");
  cy.waitForNetworkIdle(1000);
  countRows().then((length) =>
    findRowsByField("Name", /scorp/i).should("have.length", length)
  );
});

it(`can search for monsters by race`, () => {
  cy.get("#Race").select("Angel");
  cy.waitForNetworkIdle(1000);
  findRowsByField("Name", "Angeling");
});
