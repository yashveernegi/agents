import { collection } from "../config/chroma.js";
import { createEmbedding } from "./embedding.js";

export async function searchContent(question) {
  const embedding = await createEmbedding(question);
  const result = await collection.query({ queryEmbeddings: [embedding],nResults: 5});
  return result.documents[0] || [];
}