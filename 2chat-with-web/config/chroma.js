import { ChromaClient } from "chromadb";

const client = new ChromaClient();

export const collection =
  await client.getOrCreateCollection({
    name: "website-content",
    embeddingFunction: null
  });

export default client;