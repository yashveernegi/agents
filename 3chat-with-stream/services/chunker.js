import { split } from "sentence-splitter";

export async function chunkText(text, createEmbedding, similarityThreshold = 0.75, maxChunkSentences = 10) {
  const sentences = split(text).filter(node => node.type === "Sentence").map(node => node.raw.trim());

  if (sentences.length <= 1) {
    return [text];
  }
  // Generate embeddings once
  const sentenceEmbeddings = await Promise.all(
    sentences.map(createEmbedding)
  );

  const chunks = [];

  let currentChunk = [sentences[0]];
  let currentChunkEmbedding = [...sentenceEmbeddings[0]];
  let currentChunkSize = 1;

  for (let i = 1; i < sentences.length; i++) {
    const sentenceEmbedding = sentenceEmbeddings[i];
    const similarity = cosineSimilarity(
      currentChunkEmbedding,
      sentenceEmbedding
    );
    const shouldSplit = similarity < similarityThreshold || currentChunkSize >= maxChunkSentences;
    if (shouldSplit) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [sentences[i]];
      currentChunkEmbedding = [...sentenceEmbedding];
      currentChunkSize = 1;
    } else {
      currentChunk.push(sentences[i]);
      // Update running average embedding
      for (let j = 0; j < currentChunkEmbedding.length; j++) {
        currentChunkEmbedding[j] = (currentChunkEmbedding[j] * currentChunkSize + sentenceEmbedding[j]) / (currentChunkSize + 1);
      }
      currentChunkSize++;
    }
  }
  if (currentChunk.length) {
    chunks.push(currentChunk.join(" "));
  }
  return chunks;
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (
    Math.sqrt(magA) *
    Math.sqrt(magB)
  );
}