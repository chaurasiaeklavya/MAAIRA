import 'server-only';
import { randomBytes } from 'node:crypto';
import { appendFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { CleanEnquiry } from '@/lib/enquiry/schema';

/**
 * Enquiry persistence behind one interface, selected by environment:
 *
 *   ENQUIRY_STORE=supabase  (or SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set)
 *       → rows in the `enquiries` table (supabase/migrations/0001_enquiries.sql)
 *   ENQUIRY_STORE=file
 *       → JSON lines at ENQUIRY_FILE_PATH (default .data/enquiries.jsonl).
 *         Durable on a single Node server; NOT durable on serverless hosts.
 *   neither → no store (the API reports "not configured" honestly)
 */

export type EnquiryStatus = 'new' | 'contacted' | 'closed';
export const ENQUIRY_STATUSES: EnquiryStatus[] = ['new', 'contacted', 'closed'];

export interface EnquiryRecord extends CleanEnquiry {
  id: string;
  createdAt: string;
  status: EnquiryStatus;
  pieceName: string | null;
  consentAt: string;
}

export interface EnquiryStore {
  readonly kind: 'file' | 'supabase';
  create(record: EnquiryRecord): Promise<void>;
  findByIdempotencyKey(key: string): Promise<EnquiryRecord | null>;
  list(): Promise<EnquiryRecord[]>;
  updateStatus(id: string, status: EnquiryStatus): Promise<EnquiryRecord | null>;
}

export function newEnquiryId(kind: CleanEnquiry['kind']) {
  const prefix = kind === 'callback' ? 'CB' : 'EQ';
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

/* ---------------- file store ---------------- */

class FileStore implements EnquiryStore {
  readonly kind = 'file' as const;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private readonly file: string) {}

  /** Serialise all file access so concurrent requests never interleave writes. */
  private exclusive<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queue.then(task, task);
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async readAll(): Promise<EnquiryRecord[]> {
    try {
      const raw = await readFile(this.file, 'utf8');
      return raw
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line) as EnquiryRecord);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw err;
    }
  }

  create(record: EnquiryRecord) {
    return this.exclusive(async () => {
      await mkdir(path.dirname(this.file), { recursive: true });
      await appendFile(this.file, `${JSON.stringify(record)}\n`, { encoding: 'utf8', mode: 0o600 });
    });
  }

  findByIdempotencyKey(key: string) {
    return this.exclusive(async () => (await this.readAll()).find((r) => r.idempotencyKey === key) ?? null);
  }

  list() {
    return this.exclusive(async () => (await this.readAll()).reverse());
  }

  updateStatus(id: string, status: EnquiryStatus) {
    return this.exclusive(async () => {
      const all = await this.readAll();
      const rec = all.find((r) => r.id === id);
      if (!rec) return null;
      rec.status = status;
      const tmp = `${this.file}.tmp`;
      await writeFile(tmp, all.map((r) => JSON.stringify(r)).join('\n') + '\n', { encoding: 'utf8', mode: 0o600 });
      await rename(tmp, this.file);
      return rec;
    });
  }
}

/* ---------------- Supabase (PostgREST over fetch; no SDK) ---------------- */

type Row = {
  id: string;
  created_at: string;
  status: EnquiryStatus;
  kind: CleanEnquiry['kind'];
  name: string;
  email: string | null;
  phone: string | null;
  piece_id: string | null;
  piece_name: string | null;
  message: string | null;
  preferred_contact: CleanEnquiry['preferredContact'];
  callback_window: CleanEnquiry['callbackWindow'];
  consent_at: string;
  idempotency_key: string;
};

const toRow = (r: EnquiryRecord): Row => ({
  id: r.id,
  created_at: r.createdAt,
  status: r.status,
  kind: r.kind,
  name: r.name,
  email: r.email,
  phone: r.phone,
  piece_id: r.pieceId,
  piece_name: r.pieceName,
  message: r.message,
  preferred_contact: r.preferredContact,
  callback_window: r.callbackWindow,
  consent_at: r.consentAt,
  idempotency_key: r.idempotencyKey,
});

const fromRow = (r: Row): EnquiryRecord => ({
  id: r.id,
  createdAt: r.created_at,
  status: r.status,
  kind: r.kind,
  name: r.name,
  email: r.email,
  phone: r.phone,
  pieceId: r.piece_id,
  pieceName: r.piece_name,
  message: r.message,
  preferredContact: r.preferred_contact,
  callbackWindow: r.callback_window,
  consentAt: r.consent_at,
  idempotencyKey: r.idempotency_key,
});

class SupabaseStore implements EnquiryStore {
  readonly kind = 'supabase' as const;
  constructor(
    private readonly url: string,
    private readonly key: string,
  ) {}

  private async req(pathAndQuery: string, init: RequestInit = {}) {
    const res = await fetch(`${this.url.replace(/\/$/, '')}/rest/v1/${pathAndQuery}`, {
      ...init,
      headers: {
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    return res;
  }

  async create(record: EnquiryRecord) {
    await this.req('enquiries', { method: 'POST', body: JSON.stringify(toRow(record)), headers: { Prefer: 'return=minimal' } });
  }

  async findByIdempotencyKey(key: string) {
    const res = await this.req(`enquiries?idempotency_key=eq.${encodeURIComponent(key)}&select=*&limit=1`);
    const rows = (await res.json()) as Row[];
    return rows[0] ? fromRow(rows[0]) : null;
  }

  async list() {
    const res = await this.req('enquiries?select=*&order=created_at.desc&limit=500');
    return ((await res.json()) as Row[]).map(fromRow);
  }

  async updateStatus(id: string, status: EnquiryStatus) {
    const res = await this.req(`enquiries?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      headers: { Prefer: 'return=representation' },
    });
    const rows = (await res.json()) as Row[];
    return rows[0] ? fromRow(rows[0]) : null;
  }
}

/* ---------------- selection ---------------- */

let cached: EnquiryStore | null | undefined;

export function getStore(): EnquiryStore | null {
  if (cached !== undefined) return cached;
  const mode = process.env.ENQUIRY_STORE;
  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if ((mode === 'supabase' || (!mode && sbUrl && sbKey)) && sbUrl && sbKey) cached = new SupabaseStore(sbUrl, sbKey);
  else if (mode === 'file') cached = new FileStore(path.resolve(process.env.ENQUIRY_FILE_PATH || '.data/enquiries.jsonl'));
  else cached = null;
  return cached;
}
