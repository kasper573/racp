import { createRpcHandlers } from "../../utils/rpc/createRpcHandlers";
import { todoDefinition } from "./todo.definition";

export function createTodoHandlers(items: string[]) {
  return createRpcHandlers(todoDefinition.entries, {
    list(query) {
      return query?.trim() === ""
        ? items
        : items.filter((c) =>
            c.toLowerCase().includes(query?.toLowerCase() ?? "")
          );
    },
    add(item) {
      items.push(item);
    },
    remove(item) {
      const index = items.indexOf(item);
      if (index !== -1) {
        items.splice(index, 1);
        return true;
      }
      return false;
    },
  });
}
