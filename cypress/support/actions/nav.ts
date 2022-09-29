import { findRowById } from "./grid";
import { waitForPageReady } from "./common";

export function listMaps() {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Maps").click();
  waitForPageReady();
}

export function gotoMap(id: string) {
  listMaps();
  searchByIdAndClickLink(id);
}

export function listMonsters() {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Monsters").click();
  waitForPageReady();
}

export function gotoMonster(id: number) {
  listMonsters();
  searchByIdAndClickLink(id);
}

export function listItems() {
  cy.findByRole("menu", { name: "Main menu" }).findByText("Items").click();
  waitForPageReady();
}

export function gotoItem(id: number) {
  listItems();
  searchByIdAndClickLink(id);
}

function searchByIdAndClickLink(id: string | number) {
  cy.findByLabelText("ID").type(`${id}`);
  waitForPageReady(); // Wait for search to finish
  findRowById(`${id}`).findByRole("link").click();
  waitForPageReady(); // Wait for page to load
}
