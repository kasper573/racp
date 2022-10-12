import { ignoreCase } from "../util";
import { findRowById } from "./grid";
import { waitForPageReady } from "./common";
import { withFilterMenu } from "./search";

export function listMaps() {
  gotoMainMenuPage("maps");
}

export function gotoMap(id: string) {
  listMaps();
  searchByIdAndClickLink(id);
}

export function listMonsters() {
  gotoMainMenuPage("monsters");
}

export function gotoMonster(id: number) {
  listMonsters();
  searchByIdAndClickLink(id);
}

export function listItems() {
  gotoMainMenuPage("items");
}

export function listVendings() {
  gotoMainMenuPage("vendings");
}

export function gotoItem(id: number) {
  listItems();
  searchByIdAndClickLink(id);
}

export function findMainMenuItem(
  itemName: string,
  { menuName }: { menuName?: string } = {}
) {
  return findMainMenu(menuName).findByText(ignoreCase(itemName));
}

export function gotoMainMenuPage(...args: Parameters<typeof findMainMenuItem>) {
  waitForPageReady(); // Wait for any pending requests to finish before navigating
  findMainMenuItem(...args).click();
  waitForPageReady(); // Wait for any initial requests to finish before proceeding
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
  withFilterMenu(() => cy.findByLabelText("ID").type(`${id}`));
  waitForPageReady(); // Wait for search to finish
  findRowById(`${id}`).findByRole("link").click();
  waitForPageReady(); // Wait for page to load
}
