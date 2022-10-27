import { useState } from "react";
import { Item } from "../../../api/services/item/types";
import { Header } from "../../layout/Header";
import { ItemPicker } from "./ItemPicker";
import { createHunt, Hunt, HuntTable } from "./HuntTable";

export default function HuntToolPage() {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const addItems = (added: Item[]) => {
    const itemsThatDontAlreadyExist = added.filter(
      (item) => !hunts.some((i) => i.itemId === item.Id)
    );
    setHunts([...hunts, ...itemsThatDontAlreadyExist.map(createHunt)]);
  };
  return (
    <>
      <Header />
      <ItemPicker onPicked={addItems} />
      <HuntTable updateHunts={setHunts} hunts={hunts} />
    </>
  );
}
