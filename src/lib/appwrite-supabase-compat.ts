import { ID, Query } from "node-appwrite";
import { appwriteDatabaseId } from "@/lib/appwrite";
import { createAppwriteServerClient } from "@/lib/appwrite-server";

type Row = { id: string } & Record<string, any>;

const normalizeDoc = (doc: any): Row => ({ id: doc.$id, ...(doc || {}) });

const parseValue = (raw: string) => {
  if (raw === "null") return null;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return raw;
};

const parseClause = (text: string) => {
  const eq = text.match(/^([a-zA-Z0-9_]+)\.eq\.(.+)$/);
  if (eq) return { type: "eq" as const, field: eq[1], value: parseValue(eq[2]) };

  const cs = text.match(/^([a-zA-Z0-9_]+)\.cs\.\{(.+)\}$/);
  if (cs) return { type: "cs" as const, field: cs[1], values: cs[2].split(",").map((v) => v.trim()) };

  return null;
};

const applyOr = (rows: Row[], expr: string): Row[] => {
  const andGroups = Array.from(expr.matchAll(/and\(([^)]+)\)/g)).map((m) => m[1]);
  if (andGroups.length) {
    const parsedGroups = andGroups
      .map((group) => group.split(",").map((part) => parseClause(part.trim())).filter(Boolean) as any[])
      .filter((group) => group.length);

    return rows.filter((row) =>
      parsedGroups.some((group) =>
        group.every((clause: any) => {
          if (clause.type === "eq") return String(row[clause.field]) === String(clause.value);
          if (clause.type === "cs") {
            const arr = Array.isArray(row[clause.field]) ? row[clause.field] : [];
            return clause.values.every((v: string) => arr.includes(v));
          }
          return false;
        })
      )
    );
  }

  const clauses = expr.split(",").map((part) => parseClause(part.trim())).filter(Boolean) as any[];
  if (!clauses.length) return rows;

  return rows.filter((row) =>
    clauses.some((clause: any) => {
      if (clause.type === "eq") return String(row[clause.field]) === String(clause.value);
      if (clause.type === "cs") {
        const arr = Array.isArray(row[clause.field]) ? row[clause.field] : [];
        return clause.values.every((v: string) => arr.includes(v));
      }
      return false;
    })
  );
};

class CompatQuery {
  private op: "select" | "insert" | "update" | "delete" = "select";
  private selectOptions: { count?: string; head?: boolean } = {};
  private filters: Array<(row: Row) => boolean> = [];
  private orderBy: { field: string; ascending: boolean } | null = null;
  private take = 0;
  private orExpr = "";
  private payload: any = null;
  private returnSingle = false;
  private allowEmptySingle = false;

  constructor(private collection: string) {}

  select(_columns?: string, options?: { count?: string; head?: boolean }) {
    this.selectOptions = options || {};
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push((row) => String(row[field]) === String(value));
    return this;
  }

  in(field: string, values: any[]) {
    this.filters.push((row) => values.map(String).includes(String(row[field])));
    return this;
  }

  is(field: string, value: any) {
    this.filters.push((row) => (value === null ? row[field] == null : row[field] === value));
    return this;
  }

  contains(field: string, values: any[]) {
    this.filters.push((row) => {
      const arr = Array.isArray(row[field]) ? row[field] : [];
      return values.every((v) => arr.includes(v));
    });
    return this;
  }

  or(expr: string) {
    this.orExpr = expr;
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderBy = { field, ascending: options?.ascending !== false };
    return this;
  }

  limit(value: number) {
    this.take = value;
    return this;
  }

  insert(payload: any) {
    this.op = "insert";
    this.payload = payload;
    return this;
  }

  upsert(payload: any) {
    this.op = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: any) {
    this.op = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.op = "delete";
    return this;
  }

  single() {
    this.returnSingle = true;
    return this;
  }

  maybeSingle() {
    this.returnSingle = true;
    this.allowEmptySingle = true;
    return this;
  }

  private async allRows() {
    const server = createAppwriteServerClient();
    const list = await server.databases.listDocuments(appwriteDatabaseId, this.collection, [Query.limit(5000)]);
    let rows: Row[] = list.documents.map(normalizeDoc);

    for (const filter of this.filters) rows = rows.filter(filter);
    if (this.orExpr) rows = applyOr(rows, this.orExpr);

    if (this.orderBy) {
      const { field, ascending } = this.orderBy;
      rows.sort((a, b) => {
        const av = a[field] ?? "";
        const bv = b[field] ?? "";
        if (av === bv) return 0;
        return ascending ? (av > bv ? 1 : -1) : av > bv ? -1 : 1;
      });
    }

    if (this.take > 0) rows = rows.slice(0, this.take);
    return rows;
  }

  private async runSelect() {
    const rows = await this.allRows();
    const count = this.selectOptions.count === "exact" ? rows.length : null;

    if (this.selectOptions.head) {
      return { data: null, error: null, count };
    }

    if (this.returnSingle) {
      if (!rows.length && this.allowEmptySingle) return { data: null, error: null, count };
      return { data: rows[0] || null, error: rows.length ? null : { message: "No rows found" }, count };
    }

    return { data: rows, error: null, count };
  }

  private async runInsert() {
    const server = createAppwriteServerClient();
    const payloads = Array.isArray(this.payload) ? this.payload : [this.payload];
    const inserted: Row[] = [];

    for (const payload of payloads) {
      const docId = payload.id || payload.userId || ID.unique();
      const doc = await server.databases.createDocument(appwriteDatabaseId, this.collection, docId, payload);
      inserted.push(normalizeDoc(doc));
    }

    if (this.returnSingle) return { data: inserted[0] || null, error: null };
    return { data: inserted, error: null };
  }

  private async runUpdate() {
    const server = createAppwriteServerClient();
    const rows = await this.allRows();
    const updated: Row[] = [];

    for (const row of rows) {
      const doc = await server.databases.updateDocument(appwriteDatabaseId, this.collection, row.id, this.payload);
      updated.push(normalizeDoc(doc));
    }

    if (this.returnSingle) return { data: updated[0] || null, error: null };
    return { data: updated, error: null };
  }

  private async runDelete() {
    const server = createAppwriteServerClient();
    const rows = await this.allRows();
    for (const row of rows) {
      await server.databases.deleteDocument(appwriteDatabaseId, this.collection, row.id);
    }
    return { data: null, error: null };
  }

  async execute() {
    try {
      if (this.op === "insert") return await this.runInsert();
      if (this.op === "update") return await this.runUpdate();
      if (this.op === "delete") return await this.runDelete();
      return await this.runSelect();
    } catch (err: any) {
      return { data: null, error: { message: err?.message || "Appwrite operation failed" } };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute().then(onfulfilled as any, onrejected as any);
  }
}

export const createCompatClient = () => ({
  from: (collection: string) => new CompatQuery(collection),
});
