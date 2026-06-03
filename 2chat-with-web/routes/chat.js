import express from "express";
import { searchContent } from "../services/search.js";

const router = express.Router();

async function generateAnswer(question,context) {
  return `Question:${question} Context Found:${context.join("\n\n")}`;
}

router.post("/", async (req, res) => {
  try {
    console.log("Received question:", req.body.question);
    const { question } = req.body;
    const docs = await searchContent(question);
    const answer = await generateAnswer(question,docs);
    res.json({answer,sources: docs});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error.message});
  }
});

export default router;