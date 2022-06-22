import { createRpcHandlers } from "../utils/rpc/createRpcHandlers";
import { RpcException } from "../utils/rpc/RpcException";
import { serviceDefinition } from "./service.definition";
import { Authenticator } from "./authenticator";

export function createServiceHandlers(
  items: string[],
  users: User[],
  auth: Authenticator
) {
  return createRpcHandlers(serviceDefinition, {
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
    login({ username, password }) {
      const user = users.find(
        (candidate) =>
          candidate.username === username &&
          auth.compare(password, candidate.passwordHash)
      );
      if (!user) {
        throw new RpcException("Invalid credentials");
      }
      return { token: auth.sign(user.id) };
    },
  });
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
}
