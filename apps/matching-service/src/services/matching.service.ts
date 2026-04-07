import { prisma } from "../lib/prisma"
import { generateEmbedding, skillsToText } from "../lib/ embedder"

// store or update a user's vector
export const upsertUserVector = async (
  userId: string,
  userName: string,
  skills: string[]
) => {
  if (skills.length === 0) return null

  const text = skillsToText(skills)
  const embedding = await generateEmbedding(text)

  // pgvector format — array literal string
  const vectorString = `[${embedding.join(",")}]`

  // prisma doesn't support vector type natively
  // we use $executeRaw for upsert with vector
  await prisma.$executeRaw`
    INSERT INTO user_vectors ("id", "userId", "userName", "skills", "embedding", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      ${userId},
      ${userName},
      ${skills},
      ${vectorString}::vector,
      NOW(),
      NOW()
    )
    ON CONFLICT ("userId") DO UPDATE SET
      "userName"  = EXCLUDED."userName",
      "skills"    = EXCLUDED."skills",
      "embedding" = EXCLUDED."embedding",
      "updatedAt" = NOW()
  `

  console.log(`[matching] vector upserted for user: ${userName}`)
  return { userId, userName, skills }
}

// find top N users matching a query string
export const findMatchingUsers = async (
  query: string,
  limit = 10,
  threshold = 0.3  // minimum similarity score — below this we exclude
): Promise<MatchResult[]> => {
  const embedding = await generateEmbedding(query)
  const vectorString = `[${embedding.join(",")}]`

  // pgvector <=> is cosine distance (0 = identical, 2 = opposite)
  // we convert to similarity: 1 - distance
  // order by distance ascending = most similar first
  const results = await prisma.$queryRaw<RawMatchResult[]>`
    SELECT
      "userId",
      "userName",
      "skills",
      1 - (embedding <=> ${vectorString}::vector) AS similarity
    FROM user_vectors
    WHERE 1 - (embedding <=> ${vectorString}::vector) > ${threshold}
    ORDER BY embedding <=> ${vectorString}::vector
    LIMIT ${limit}
  `

  return results.map((r) => ({
    userId: r.userId,
    userName: r.userName,
    skills: r.skills,
    similarity: Number(r.similarity).toFixed(3),
  }))
}

// delete vector when user deletes account
export const deleteUserVector = async (userId: string) => {
  await prisma.$executeRaw`
    DELETE FROM user_vectors WHERE "userId" = ${userId}
  `
}

interface RawMatchResult {
  userId: string
  userName: string
  skills: string[]
  similarity: number
}

export interface MatchResult {
  userId: string
  userName: string
  skills: string[]
  similarity: string
}