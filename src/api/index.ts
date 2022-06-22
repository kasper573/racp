import "dotenv/config";
import * as http from "http";
import * as express from "express";
import cors = require("cors");
import * as morgan from "morgan";
import { apiPort } from "../shared/env";
import { apiServiceDefinition } from "../shared/apiServiceDefinition";
import { createRpcMiddleware } from "../utils/rpc/createRpcMiddleware";
import { apiServiceHandler } from "./service";

const app = express();

app.use(morgan("combined"));
app.use(cors());
app.use(createRpcMiddleware(apiServiceDefinition, apiServiceHandler));

http.createServer(app).listen(apiPort, () => {
  console.log(`API is running on port ${apiPort}`);
});
