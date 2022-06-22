import * as jwt from "jsonwebtoken";
import { createRpcHandlers } from "../utils/rpc/createRpcHandlers";
import { serviceDefinition } from "./service.definition";

export function createServiceHandlers(db: string[], jwtSecret: string) {
  return createRpcHandlers(serviceDefinition, {
    list(query) {
      return query?.trim() === ""
        ? db
        : db.filter((c) =>
            c.toLowerCase().includes(query?.toLowerCase() ?? "")
          );
    },
    add(item) {
      db.push(item);
    },
    remove(item) {
      const index = db.indexOf(item);
      if (index !== -1) {
        db.splice(index, 1);
        return true;
      }
      return false;
    },
    login(creds) {
      if (creds.username === "admin" && creds.password === "admin") {
        const token = jwt.sign(creds, jwtSecret, { expiresIn: 129600 });
        return { token };
      }
      throw new Error("Invalid credentials");
    },
  });
}
