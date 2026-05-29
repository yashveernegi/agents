import express from "express";
import OpenAI from "openai";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { ChromaClient } from "chromadb";
import { pipeline } from "@xenova/transformers";
const chroma = new ChromaClient();
const collectionName = "pdf-docs";
async function getCollection() {
  return await chroma.getOrCreateCollection({
    name: collectionName,
    embeddingFunction: {
      generate: async (texts) => {
        return Promise.all(
          texts.map(text => createEmbedding(text))
        );
      }
    }
  });
}
const messages = [{ role: "system", content: "You are a helpful AI assistant. get the relevant information from the provided context to answer the user's question. Answer should be only within the provided context. Return full context in your answer." }];

const collections = await chroma.listCollections();
console.log(collections);
// await chroma.deleteCollection({
//   name: collectionName,
// });


const extractor = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

async function createEmbedding(text) {

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

async function getChunks(queryEmbedding) {
  const collection = await getCollection();
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 3,
  });
  // --------------------------------------
  // RETURN MATCHING CHUNKS
  // --------------------------------------
  console.log("\n🔍 RAW CHROMA RESULT:", results);
  return results.documents[0].join("\n");
}
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function chunkText(text, chunkSize = 500, overlap = 100) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = start + chunkSize;
    const chunk = text.slice(start, end);
    chunks.push(chunk.trim());
    start += chunkSize - overlap;
  }
  return chunks;
}


const upload = multer({ dest: "uploads/" });

async function parsePDF() {
  const data = new Uint8Array(
    fs.readFileSync("./sample.pdf")
  );
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  console.log("Total pages:", pdf.numPages);
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map(item => item.str)
      .join(" ");
    fullText += text + "\n";
  }
  return fullText;
  // console.log(fullText);
}
// parsePDF();



const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello from Express");
});


app.post("/upload", async (req, res) => {
  const fullText = await parsePDF();

  // chunk text
  const chunks = chunkText(fullText, 200, 50);
  // create embeddings

  // --------------------------------------
  // SAVE EACH CHUNK
  // --------------------------------------
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`\nCreating embedding for chunk ${i + 1}`);

    // CREATE EMBEDDING
    const embedding = await createEmbedding(chunk);
    const collection = await getCollection();
    // SAVE TO CHROMA
    await collection.add({
      ids: [`chunk-${i}`],
      documents: [chunk],
      embeddings: [embedding],
      metadatas: [
        {
          chunkNumber: i + 1,
        },
      ],
    });
    console.log(`Saved chunk ${i + 1}`);
  }
  // save in chromadb

  res.json({ success: true });
});

app.post("/chat", async (req, res) => {


  // --------------------------------------
  // CREATE QUERY EMBEDDING

  // --------------------------------------
  const queryEmbedding = await createEmbedding(req.body.question);
  // --------------------------------------
  // VECTOR SEARCH
  // --------------------------------------
  const chunks = await getChunks(queryEmbedding);

  //   // build prompt

  //   // call openai
  messages.push({ role: "user", content: `Context:\n${chunks}\n\nQuestion: ${req.body.question}` });
  const chatRes = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
  });

  const finalAnswer = chatRes.choices[0].message.content;

  res.json({
    answer: finalAnswer
  });
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});




