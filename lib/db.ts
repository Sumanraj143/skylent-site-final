import { MongoClient, type Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _skylentMongo: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _skylentIndexes: Promise<void> | undefined;
}

function connect(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local (local) or Vercel Environment Variables.");

  if (!global._skylentMongo) {
    global._skylentMongo = new MongoClient(uri).connect();
    // If the first connection fails, allow the next request to retry.
    global._skylentMongo.catch(() => {
      global._skylentMongo = undefined;
    });
  }
  return global._skylentMongo;
}

async function ensureIndexes(db: Db) {
  try {
    await Promise.all([
      db.collection("users").createIndex({ email: 1 }, { unique: true }),
      db.collection("users").createIndex({ batchId: 1 }),
      db.collection("projects").createIndex({ slug: 1 }, { unique: true }),
    ]);
  } catch (error) {
    // Usually means old duplicate data exists. The app still works; log it so it can be cleaned up.
    console.error("INDEX SETUP WARNING:", error instanceof Error ? error.message : error);
  }
}

export async function getDb(): Promise<Db> {
  const client = await connect();
  const db = client.db(process.env.MONGODB_DB || "skylent");
  if (!global._skylentIndexes) global._skylentIndexes = ensureIndexes(db);
  await global._skylentIndexes;
  return db;
}
