import express = require("express");
import "dotenv/config";

const app = express();
const port = process.env.API_PORT;

app.get("/", (req, res) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`API is running on port ${port}`);
});
