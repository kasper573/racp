import { findRowById } from "./grid";
import { waitForPageReady } from "./common";

export function listMaps() {
  clickMainMenuItem("Maps");
  waitForPageReady();
}

export function gotoMap(id: string) {
  listMaps();
  searchByIdAndClickLink(id);
}

export function listMonsters() {
  clickMainMenuItem("Monsters");
  waitForPageReady();
}

export function gotoMonster(id: number) {
  listMonsters();
  searchByIdAndClickLink(id);
}

export function listItems() {
  clickMainMenuItem("Items");
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
  findMainMenu(menuName).findByText(itemName).click();
}

export function findMainMenu(name: string = "Public menu") {
  return cy.get("body").then(($body) => {
    const [menuTrigger] = $body.find(`button[aria-label="Open main menu"]`);
    if (menuTrigger) {
      menuTrigger.click();
    }
    return cy.findByRole("menu", { name });
  });
}

function searchByIdAndClickLink(id: string | number) {
  cy.findByLabelText("ID").type(`${id}`);
  waitForPageReady(); // Wait for search to finish
  findRowById(`${id}`).findByRole("link").click();
  waitForPageReady(); // Wait for page to load
}
