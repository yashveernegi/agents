import express from "express";
import chatRoute from "./routes/chat.js";
import { indexWebsite } from "./services/indexWebsite.js";

const app = express();

app.use(express.json());

app.use("/chat", chatRoute);

const WEBSITE_URL = "https://react.dev/learn/installation";
await indexWebsite(WEBSITE_URL);

app.listen(3000, () => {
  console.log(
    "Server running on port 3000"
  );
});