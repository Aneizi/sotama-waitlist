import { createClient, type RedisClientType } from "redis";
import { promises as fs } from "node:fs";
import path from "node:path";

const KEY_SET = "sotama:waitlist:emails";
const KEY_LIST = "sotama:waitlist:entries";

type Entry = { email: string; ts: number; ref?: string };

// Cache a single TCP connection per warm Lambda instance.
const cache = ((globalThis as unknown as {
  __sotamaRedis?: { client: RedisClientType | null; promise: Promise<RedisClientType | null> | null };
}).__sotamaRedis ??= { client: null, promise: null });

function findRedisUrl(): string | null {
  return (
    process.env.REDIS_URL ??
    process.env.KV_URL ??
    process.env.STORAGE_REDIS_URL ??
    process.env.STORAGE_KV_URL ??
    null
  );
}

async function getClient(): Promise<RedisClientType | null> {
  if (cache.client?.isOpen) return cache.client;
  if (cache.promise) return cache.promise;
  const url = findRedisUrl();
  if (!url) return null;

  cache.promise = (async () => {
    const c = createClient({
      url,
      socket: { connectTimeout: 10_000, reconnectStrategy: false },
    }) as RedisClientType;
    c.on("error", (err) => console.error("[redis] client error", err));
    await c.connect();
    cache.client = c;
    return c;
  })();

  try {
    return await cache.promise;
  } finally {
    cache.promise = null;
  }
}

export function diagnostics() {
  const seen: string[] = [];
  const interesting = /^(REDIS_|KV_|UPSTASH_|STORAGE_)/;
  for (const k of Object.keys(process.env)) {
    if (interesting.test(k)) seen.push(k);
  }
  return {
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    vercelEnv: process.env.VERCEL_ENV ?? "unset",
    region: process.env.VERCEL_REGION ?? "unset",
    redisUrlPresent: !!findRedisUrl(),
    seenEnvVarNames: seen.sort(),
  };
}

const LOCAL_FILE = path.join(process.cwd(), ".waitlist.local.json");

async function readLocal(): Promise<Entry[]> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocal(entries: Entry[]): Promise<void> {
  await fs.writeFile(LOCAL_FILE, JSON.stringify(entries, null, 2), "utf8");
}

export type AddResult = { added: boolean; count: number };

export async function addEmail(email: string, ref?: string): Promise<AddResult> {
  const normalized = email.trim().toLowerCase();
  const client = await getClient();

  if (client) {
    const added = await client.sAdd(KEY_SET, normalized);
    if (added) {
      const entry: Entry = { email: normalized, ts: Date.now(), ref };
      await client.lPush(KEY_LIST, JSON.stringify(entry));
    }
    const count = await client.sCard(KEY_SET);
    return { added: added === 1, count: Number(count) };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "No REDIS_URL / KV_URL in environment. Connect Upstash Redis in the Vercel dashboard and redeploy.",
    );
  }

  const entries = await readLocal();
  const exists = entries.some((e) => e.email === normalized);
  if (!exists) {
    entries.unshift({ email: normalized, ts: Date.now(), ref });
    await writeLocal(entries);
  }
  return { added: !exists, count: entries.length };
}

export async function getCount(): Promise<number> {
  const client = await getClient();
  if (client) return Number(await client.sCard(KEY_SET));
  const entries = await readLocal();
  return entries.length;
}
