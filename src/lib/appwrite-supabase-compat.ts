import { ID, Permission, Query, Role } from "node-appwrite";
import { appwriteDatabaseId } from "@/lib/appwrite";
import { createAppwriteServerClient } from "@/lib/appwrite-server";

type Row = { id: string } & Record<string, any>;

const FIELD_ALIASES: Record<string, Record<string, string>> = {
  profiles: {
    first_name: "firstName",
    last_name: "lastName",
    company_name: "companyName",
    contact_person: "contactPerson",
    is_approved: "isApproved",
    rejection_reason: "rejectionReason",
    experience_level: "experienceLevel",
    profile_image: "profileImage",
    cv_file: "cvFile",
    portfolio_items: "portfolioItems",
    experience_entries: "experienceEntries",
    fashion_projects: "fashionProjects",
    created_at: "createdAt",
    updated_at: "updatedAt",
  },
  messages: {
    sender_id: "senderId",
    receiver_id: "receiverId",
    project_id: "projectId",
    is_read: "isRead",
    read_at: "readAt",
    created_at: "createdAt",
  },
  projects: {
    project_title: "projectTitle",
    company_id: "companyId",
    designer_ids: "designerIds",
    chat_enabled: "chatEnabled",
    created_at: "createdAt",
    updated_at: "updatedAt",
  },
};

const toCanonicalField = (collection: string, field: string) => {
  return FIELD_ALIASES[collection]?.[field] || field;
};

const withAliases = (collection: string, row: Row): Row => {
  const aliases = FIELD_ALIASES[collection] || {};
  const out: Row = { ...row };

  for (const [legacy, canonical] of Object.entries(aliases)) {
    if (out[canonical] === undefined && out[legacy] !== undefined) {
      out[canonical] = out[legacy];
    }
    if (out[legacy] === undefined && out[canonical] !== undefined) {
      out[legacy] = out[canonical];
    }
  }

  return out;
};

const rowField = (collection: string, row: Row, field: string) => {
  if (row[field] !== undefined) return row[field];
  const canonical = toCanonicalField(collection, field);
  return row[canonical];
};

const normalizeWritePayload = (collection: string, payload: Record<string, any>) => {
  const out: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload || {})) {
    if (value === undefined) continue;
    if (key === "id" || key === "$id") continue;
    out[toCanonicalField(collection, key)] = value;
  }

  return out;
};

const asUserId = (value: unknown) => String(value || "").trim();

const buildPermissions = (collection: string, payload: Record<string, any>) => {
  if (!payload || typeof payload !== "object") return undefined;

  if (collection === "profiles") {
    const userId = asUserId(payload.userId);
    if (!userId) return undefined;
    return [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];
  }

  if (collection === "messages") {
    const senderId = asUserId(payload.senderId ?? payload.sender_id);
    const receiverId = asUserId(payload.receiverId ?? payload.receiver_id);
    const readers = [senderId, receiverId].filter(Boolean);
    if (!readers.length) return undefined;

    const perms = readers.map((id) => Permission.read(Role.user(id)));
    if (senderId) {
      perms.push(Permission.update(Role.user(senderId)), Permission.delete(Role.user(senderId)));
    }
    return perms;
  }

  if (collection === "projects") {
    const companyId = asUserId(payload.companyId ?? payload.company_id);
    const designerIds = Array.isArray(payload.designerIds)
      ? payload.designerIds
      : Array.isArray(payload.designer_ids)
      ? payload.designer_ids
      : [];
    const participants = Array.isArray(payload.participants) ? payload.participants : [];
    const memberIds = [...new Set([companyId, ...designerIds, ...participants].map(asUserId).filter(Boolean))];
    if (!memberIds.length) return undefined;

    const perms = memberIds.map((id) => Permission.read(Role.user(id)));
    if (companyId) {
      perms.push(Permission.update(Role.user(companyId)), Permission.delete(Role.user(companyId)));
    }
    return perms;
  }

  return undefined;
};

const normalizeDoc = (doc: any, collection: string): Row => withAliases(collection, { id: doc.$id, ...(doc || {}) });

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

const applyOr = (collection: string, rows: Row[], expr: string): Row[] => {
  const andGroups = Array.from(expr.matchAll(/and\(([^)]+)\)/g)).map((m) => m[1]);
  if (andGroups.length) {
    const parsedGroups = andGroups
      .map((group) => group.split(",").map((part) => parseClause(part.trim())).filter(Boolean) as any[])
      .filter((group) => group.length);

    return rows.filter((row) =>
      parsedGroups.some((group) =>
        group.every((clause: any) => {
          if (clause.type === "eq") return String(rowField(collection, row, clause.field)) === String(clause.value);
          if (clause.type === "cs") {
            const arrValue = rowField(collection, row, clause.field);
            const arr = Array.isArray(arrValue) ? arrValue : [];
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
      if (clause.type === "eq") return String(rowField(collection, row, clause.field)) === String(clause.value);
      if (clause.type === "cs") {
        const arrValue = rowField(collection, row, clause.field);
        const arr = Array.isArray(arrValue) ? arrValue : [];
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
    this.filters.push((row) => String(rowField(this.collection, row, field)) === String(value));
    return this;
  }

  in(field: string, values: any[]) {
    this.filters.push((row) => values.map(String).includes(String(rowField(this.collection, row, field))));
    return this;
  }

  is(field: string, value: any) {
    this.filters.push((row) => {
      const rowValue = rowField(this.collection, row, field);
      return value === null ? rowValue == null : rowValue === value;
    });
    return this;
  }

  contains(field: string, values: any[]) {
    this.filters.push((row) => {
      const rowValue = rowField(this.collection, row, field);
      const arr = Array.isArray(rowValue) ? rowValue : [];
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
    const allDocs: any[] = [];
    let offset = 0;
    const pageSize = 100;

    while (true) {
      const list = await server.databases.listDocuments(appwriteDatabaseId, this.collection, [
        Query.limit(pageSize),
        Query.offset(offset),
      ]);

      allDocs.push(...list.documents);
      if (list.documents.length < pageSize) break;

      offset += pageSize;
      if (offset > 5000) break;
    }

    let rows: Row[] = allDocs.map((doc) => normalizeDoc(doc, this.collection));

    for (const filter of this.filters) rows = rows.filter(filter);
    if (this.orExpr) rows = applyOr(this.collection, rows, this.orExpr);

    if (this.orderBy) {
      const { field, ascending } = this.orderBy;
      rows.sort((a, b) => {
        const av = rowField(this.collection, a, field) ?? "";
        const bv = rowField(this.collection, b, field) ?? "";
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
      const writePayload = normalizeWritePayload(this.collection, payload || {});
      const docId = payload.id || payload.userId || ID.unique();
      const permissions = buildPermissions(this.collection, writePayload);
      const doc = await server.databases.createDocument(
        appwriteDatabaseId,
        this.collection,
        docId,
        writePayload,
        permissions
      );
      inserted.push(normalizeDoc(doc, this.collection));
    }

    if (this.returnSingle) return { data: inserted[0] || null, error: null };
    return { data: inserted, error: null };
  }

  private async runUpdate() {
    const server = createAppwriteServerClient();
    const rows = await this.allRows();
    const updated: Row[] = [];
    const writePayload = normalizeWritePayload(this.collection, this.payload || {});

    for (const row of rows) {
      const doc = await server.databases.updateDocument(appwriteDatabaseId, this.collection, row.id, writePayload);
      updated.push(normalizeDoc(doc, this.collection));
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
