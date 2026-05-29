import { ChromaClient } from "chromadb";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";

// connect to running Chroma server
const client = new ChromaClient({
  host: "localhost",
  port: 8000,
});

// embedding function (IMPORTANT FIX)
const embedder = new DefaultEmbeddingFunction();
//delete old cache (for testing, safe to run multiple times)
await client.deleteCollection({
  name: "docs",
});

// collection (safe init)
export const collection = await client.getOrCreateCollection({
  name: "docs",
  embeddingFunction: embedder,
});

// add documents (run once or safe re-run)
export async function addDocs() {
  await collection.add({
    ids: ["1", "2", "3", "4"],
    documents: [
      "Node.js is a JavaScript runtime built on V8.",
      "Yashveer is using ChromaDB with OpenAI.",
      "ChromaDB is a vector database for AI search.",
      "We can build applications with ChromaDB and nodejs together."
    ]
  });
}

// retrieve relevant context
export async function retrieveContext(query) {
  const allData = await collection.get();
  console.log("\n ALL DATA IN CHROMADB:");
  console.log(JSON.stringify(allData.documents, null, 2));



  const res = await collection.query({
    queryTexts: [query],
    nResults: 3,
  });

  console.log("\n🔍 RAW CHROMA RESULT:");
  console.log(JSON.stringify(res.documents, null, 2));

  const context = res.documents?.[0]?.join("\n") || "";

  console.log("\n📦 FINAL CONTEXT SENT TO LLM:");
  console.log(context);

  return context;
}