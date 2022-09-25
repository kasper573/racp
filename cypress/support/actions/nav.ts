import { findRowById } from "./grid";
import { waitForPageReady } from "./common";

export function listMaps() {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Maps").click();
  waitForPageReady();
}

export function gotoMap(id: string) {
  listMaps();
  cy.findByLabelText("ID").type(id);
  waitForPageReady();
  findRowById(id).findByRole("link").click();
}

export function listMonsters() {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Monsters").click();
  waitForPageReady();
}

export function gotoMonster(id: number) {
  listMonsters();
  cy.findByLabelText("ID").type(`${id}`);
  waitForPageReady();
  findRowById(`${id}`).findByRole("link").click();
}

export function listItems() {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Items").click();
  waitForPageReady();
}

export function gotoItem(id: number) {
  listItems();
  cy.findByLabelText("ID").type(`${id}`);
  waitForPageReady();
  findRowById(`${id}`).findByRole("link").click();
}

// Bump
