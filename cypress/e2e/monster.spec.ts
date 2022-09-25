import {
  countRows,
  findRowById,
  findRowsByField,
  listMonsters,
  menuSlide,
  waitForLoadingSpinner,
} from "../support/actions";

beforeEach(() => {
  cy.visit("/");
  listMonsters();
});

it(`can search for monsters by id`, () => {
  cy.findByLabelText("ID").type("1309");
  waitForLoadingSpinner();
  findRowById(1309);
});

it(`can search for monsters by name`, () => {
  cy.findByLabelText("Name").type("dopp");
  waitForLoadingSpinner();
  countRows().then((length) =>
    findRowsByField("Name", /dopp/i).should("have.length", length)
  );
});

it(`can search for monsters by race`, () => {
  cy.get("#Race").select("Angel");
  waitForLoadingSpinner();
  findRowsByField("Name", "Angeling");
});

it(`can search for monsters by element`, () => {
  cy.get("#Element").select("Earth");
  waitForLoadingSpinner();
  findRowsByField("Name", "Fabre");
});

it(`can search for monsters by size`, () => {
  cy.get("#Size").select("Small");
  waitForLoadingSpinner();
  findRowsByField("Name", "Familiar");
});
