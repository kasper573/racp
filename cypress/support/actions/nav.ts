import { findRowById } from "./grid";
import { createPageAction } from "./common";

export const listMaps = createPageAction(() => {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Maps").click();
});

export function gotoMap(id: string) {
  listMaps();
  cy.findByLabelText("ID").type(id);
  findRowById(id).findByRole("link").click();
}

export const listMonsters = createPageAction(() => {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Monsters").click();
});

export function gotoMonster(id: number) {
  listMonsters();
  cy.findByLabelText("ID").type(`${id}`);
  findRowById(`${id}`).findByRole("link").click();
}

export const listItems = createPageAction(() => {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Items").click();
});

export function gotoItem(id: number) {
  listItems();
  cy.findByLabelText("ID").type(`${id}`);
  findRowById(`${id}`).findByRole("link").click();
}
