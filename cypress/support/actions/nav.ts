import { findRowById } from "./grid";

export function listMaps() {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Maps").click();
}

export function gotoMap(id: string) {
  listMaps();
  cy.findByLabelText("ID").type(id);
  findRowById(id).findByRole("link").click();
}

export function listMonsters() {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Monsters").click();
}

export function gotoMonster(id: number) {
  listMonsters();
  cy.findByLabelText("ID").type(`${id}`);
  findRowById(`${id}`).findByRole("link").click();
}

export function listItems() {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Items").click();
}

export function gotoItem(id: number) {
  listItems();
  cy.findByLabelText("ID").type(`${id}`);
  findRowById(`${id}`).findByRole("link").click();
}
