import { ignoreCase } from "../util";
import { findRowById } from "./grid";
import { withFilterMenu } from "./search";

export function listMaps() {
  gotoMainMenuPage("maps");
}

export function gotoMap(id: string) {
  listMaps();
  searchByIdAndFollowLink(id);
}

export function listMonsters() {
  gotoMainMenuPage("monsters");
}

export function gotoMonster(id: number) {
  listMonsters();
  searchByIdAndFollowLink(id);
}

export function listItems() {
  gotoMainMenuPage("items");
}

export function listVendings() {
  gotoMainMenuPage("vendings");
}

export function gotoItem(id: number) {
  listItems();
  searchByIdAndFollowLink(id);
}

export function findMainMenuItem(
  itemName: string,
  { menuName }: { menuName?: string } = {}
) {
  return findMainMenu(menuName).findByText(ignoreCase(itemName));
}

export function gotoMainMenuPage(...args: Parameters<typeof findMainMenuItem>) {
  findMainMenuItem(...args).click();
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

function searchByIdAndFollowLink(id: string | number) {
  withFilterMenu(() => cy.findByLabelText("ID").type(`${id}`));
  findRowById(`${id}`).findByRole("link").click();
}
