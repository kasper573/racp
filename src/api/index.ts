import * as http from "http";
import * as path from "path";
import * as express from "express";
import cors = require("cors");
import { expressjwt as jwt, Request as JWTRequest } from "express-jwt";
import { createRpcMiddleware } from "../utils/rpc/createRpcMiddleware";
import { loadEnvVars } from "../utils/loadEnvVars";
import { serviceDefinition } from "./service.definition";
import { createServiceHandlers } from "./service.handlers";

const rootDir = path.resolve(__dirname, "..", "..");
const env = loadEnvVars(rootDir, /^api_/);

const port = env.api_port;
const database: string[] = ["Initial"];
const app = express();
const secret = env.api_jwtSecret ?? "";
const auth = jwt({
  secret,
  algorithms: ["HS256"],
  credentialsRequired: false,
});
const isAuthenticated = (req: JWTRequest) => !!req.auth;

app.use(auth);
app.use(cors());
app.use(
  createRpcMiddleware(
    serviceDefinition,
    createServiceHandlers(database, secret),
    isAuthenticated
  )
);

http.createServer(app).listen(port, () => {
  console.log(`API is running on port ${port}`);
});
