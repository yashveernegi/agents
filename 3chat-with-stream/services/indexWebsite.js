import { scrapeWebsiteText } from "./scraper.js";
import { chunkText } from "./chunker.js";
import { createEmbedding } from "./embedding.js";
import client, { collection } from "../config/chroma.js";

export async function insertDataInChunks() {

  // await client.deleteCollection({
  //   name: "website-content",
  // });
  // return
  const count = await collection.count();
  if (count) {
    console.log("count===", count)
    return count
  }
  // console.log(results.documents);
  // return
  console.log("Scraping website...");

  const text = await scrapeWebsiteText();
  const chunks = await chunkText(text, createEmbedding);

  console.log(`Creating embeddings for ${chunks.length} chunks`);

  const ids = [];
  const embeddings = [];
  const documents = [];

  for (let i = 0; i < chunks.length; i++) {
    ids.push(`${Date.now()}-${i}`);
    embeddings.push(await createEmbedding(chunks[i]));
    documents.push(chunks[i]);
    console.log(`Prepared chunk ${i + 1}/${chunks.length}`);
  }

  await collection.add({ ids, embeddings, documents });
  console.log(`Indexed chunk collection`);
}