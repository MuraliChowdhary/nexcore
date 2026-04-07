import { pipeline, env } from "@xenova/transformers"

// cache model locally — works same on local and Render
env.cacheDir = "./.model-cache"

let embedder: any = null

// singleton — load model once, reuse forever
const getEmbedder = async () => {
  if (!embedder) {
    console.log("matching-service: loading embedding model...")
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
      // 384-dimensional model
      // same one used in production RAG systems
      // 25MB download, cached after first run
    )
    console.log("matching-service: embedding model ready")
  }
  return embedder
}

export const generateEmbedding = async (
  text: string
): Promise<number[]> => {
  const model = await getEmbedder()

  const output = await model(text, {
    pooling: "mean",      // average all token embeddings → one vector
    normalize: true,      // normalize to unit length for cosine similarity
  })

  // output.data is a Float32Array → convert to plain number[]
  return Array.from(output.data) as number[]
}

// convert skills array to a single meaningful string
// "React, TypeScript, Node.js" is better than ["React","TypeScript","Node.js"]
export const skillsToText = (skills: string[]): string => {
  return skills.join(", ")
}