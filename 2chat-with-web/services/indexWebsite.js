import { scrapeWebsite } from "./scraper.js";
import { chunkText } from "./chunker.js";
import { createEmbedding } from "./embedding.js";
import client,{ collection } from "../config/chroma.js";

export async function indexWebsite(url) {
  console.log("Scraping website...");

  const text = await scrapeWebsite(url);

  const chunks = chunkText(text);

  console.log(
    `Creating embeddings for ${chunks.length} chunks`
  );
//   await client.deleteCollection({
//   name: 'website-content',
// });
  for (let i = 0; i < chunks.length; i++) {
    const embedding =
      await createEmbedding(chunks[i]);

    await collection.add({
      ids: [`${Date.now()}-${i}`],
      embeddings: [embedding],
      documents: [chunks[i]],
      metadatas: [
        {
          source: url
        }
      ]
    });

    console.log(
      `Indexed chunk ${i + 1}/${chunks.length}`
    );
  }

  console.log("Indexing completed");
}