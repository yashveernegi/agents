import express from "express";
import chatRoute from "./routes/chat.js";
import { insertDataInChunks } from "./services/indexWebsite.js";

const app = express();

app.use(express.json());

app.use("/chat", chatRoute);
/**
 * insert data in chunks to chroma db on init, once inserted first time then coment below code of saving data in DB and call /chat
 */
await insertDataInChunks();

app.listen(3000, () => {
  console.log(
    "Server running on port 3000"
  );
});