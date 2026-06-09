import express from "express";
import { searchContent } from "../services/search.js";
import { cllLLm } from "./llmCall.js"
const router = express.Router();

async function generateAnswer(question, context) {
  return `Question:${question} Context Found:${context.join("\n\n")}`;
}

router.post("/", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const docs = await searchContent(req.body.question);
  await cllLLm(res, docs.join("\n"), req.body.question);
  res.write("data: [DONE]\n\n");
  res.end();
});

export default router;