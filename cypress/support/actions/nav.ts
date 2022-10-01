import { ignoreCase } from "../util";
import { findRowById } from "./grid";
import { waitForPageReady } from "./common";

export function listMaps() {
  clickMainMenuItem("maps");
  waitForPageReady();
}

export function gotoMap(id: string) {
  listMaps();
  searchByIdAndClickLink(id);
}

export function listMonsters() {
  clickMainMenuItem("monsters");
  waitForPageReady();
}

export function gotoMonster(id: number) {
  listMonsters();
  searchByIdAndClickLink(id);
}

export function listItems() {
  clickMainMenuItem("items");
  waitForPageReady();
}

export function gotoItem(id: number) {
  listItems();
  searchByIdAndClickLink(id);
}

export function clickMainMenuItem(
  itemName: string,
  { menuName }: { menuName?: string } = {}
) {
  findMainMenu(menuName).findByText(ignoreCase(itemName)).click();
}

export function findMainMenu(name: string = "public menu") {
  return cy.get("body").then(($body) => {
    const [menuTrigger] = $body.find(`button[aria-label="Open main menu"]`);
    if (menuTrigger) {
      menuTrigger.click();
    }
    return cy.findByRole("menu", { name: ignoreCase(name) });
  });
}

function searchByIdAndClickLink(id: string | number) {
  cy.findByLabelText("ID").type(`${id}`);
  waitForPageReady(); // Wait for search to finish
  findRowById(`${id}`).findByRole("link").click();
  waitForPageReady(); // Wait for page to load
}
