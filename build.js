import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";
import { EXAM_QUESTIONS } from "./questions.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, "Test_DB.sql");
const dbPath = path.join(__dirname, "Test_DB.sqlite");
const htmlPath = path.join(__dirname, "index.html");

const TABLES = [
  "ACCOUNT",
  "ACC_TRANSACTION",
  "BRANCH",
  "BUSINESS",
  "CUSTOMER",
  "DEPARTMENT",
  "EMPLOYEE",
  "INDIVIDUAL",
  "OFFICER",
  "PRODUCT",
  "PRODUCT_TYPE",
];

const RELATIONSHIPS = [
  { from: "CUSTOMER", to: "ACCOUNT", label: "CUST_ID" },
  { from: "BRANCH", to: "ACCOUNT", label: "OPEN_BRANCH_ID" },
  { from: "EMPLOYEE", to: "ACCOUNT", label: "OPEN_EMP_ID" },
  { from: "PRODUCT", to: "ACCOUNT", label: "PRODUCT_CD" },
  { from: "ACCOUNT", to: "ACC_TRANSACTION", label: "ACCOUNT_ID" },
  { from: "BRANCH", to: "ACC_TRANSACTION", label: "EXECUTION_BRANCH_ID" },
  { from: "EMPLOYEE", to: "ACC_TRANSACTION", label: "TELLER_EMP_ID" },
  { from: "CUSTOMER", to: "BUSINESS", label: "CUST_ID" },
  { from: "BRANCH", to: "EMPLOYEE", label: "ASSIGNED_BRANCH_ID" },
  { from: "DEPARTMENT", to: "EMPLOYEE", label: "DEPT_ID" },
  { from: "EMPLOYEE", to: "EMPLOYEE", label: "SUPERIOR_EMP_ID" },
  { from: "CUSTOMER", to: "INDIVIDUAL", label: "CUST_ID" },
  { from: "CUSTOMER", to: "OFFICER", label: "CUST_ID" },
  { from: "PRODUCT_TYPE", to: "PRODUCT", label: "PRODUCT_TYPE_CD" },
];

function adaptMysqlToSqlite(source) {
  let sql = source
    .replace(/DROP DATABASE IF EXISTS[^;]+;/gi, "")
    .replace(/CREATE DATABASE IF NOT EXISTS[^;]+;/gi, "")
    .replace(/USE\s+\w+\s*;/gi, "")
    .replace(/SET SQL_SAFE_UPDATES\s*=\s*\d+\s*;/gi, "")
    .replace(/\bbigint\b/gi, "INTEGER")
    .replace(/\bfloat\b/gi, "REAL")
    .replace(/\bvarchar\([^)]+\)/gi, "TEXT")
    .replace(/\bdate\b/gi, "TEXT")
    .replace(/\bdatetime\b/gi, "TEXT")
    .replace(/integer not null auto_increment/gi, "INTEGER PRIMARY KEY AUTOINCREMENT")
    .replace(/,\s*primary key\s*\([^)]+\)/gi, "")
    .replace(/alter table[\s\S]*?references[\s\S]*?;/gi, "")
    .replace(/create temporary table/gi, "CREATE TEMP TABLE");

  return sql;
}

function splitStatements(sql) {
  const statements = [];
  let current = "";
  let inString = false;
  let quote = "";

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const prev = sql[i - 1];

    if ((ch === "'" || ch === '"') && prev !== "\\") {
      if (!inString) {
        inString = true;
        quote = ch;
      } else if (ch === quote) {
        inString = false;
      }
    }

    if (ch === ";" && !inString) {
      const trimmed = current.trim();
      if (trimmed && !trimmed.startsWith("--")) {
        statements.push(trimmed);
      }
      current = "";
      continue;
    }

    current += ch;
  }

  const tail = current.trim();
  if (tail && !tail.startsWith("--")) {
    statements.push(tail);
  }

  return statements;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildMermaidErd() {
  const lines = ["erDiagram"];
  for (const rel of RELATIONSHIPS) {
    const left = rel.from === rel.to ? rel.from : rel.from;
    const right = rel.to;
    const cardinality = rel.from === rel.to ? "||--o{" : "||--o{";
    lines.push(`    ${left} ${cardinality} ${right} : "${rel.label}"`);
  }
  return lines.join("\n");
}

function getTableSchema(db, tableName) {
  const columns = db.exec(`PRAGMA table_info(${tableName})`)[0];
  if (!columns) return [];
  return columns.values.map(([cid, name, type, notnull, dflt, pk]) => ({
    name,
    type,
    notnull: Boolean(notnull),
    pk: Boolean(pk),
  }));
}

function getTableRows(db, tableName, limit = 50) {
  const result = db.exec(`SELECT * FROM ${tableName} LIMIT ${limit}`);
  if (!result[0]) return { columns: [], rows: [] };
  return { columns: result[0].columns, rows: result[0].values };
}

function renderQuestionsSection() {
  const nav = EXAM_QUESTIONS.map((q) => `<a href="#q${q.id}">שאלה ${q.id}</a>`).join("");
  const cards = EXAM_QUESTIONS.map((q) => {
    const opts = q.options.map((o) => `<li>${escapeHtml(o)}</li>`).join("");
    return `
    <article class="question-card" id="q${q.id}">
      <div class="q-badge">שאלה ${q.id}</div>
      <p class="q-he">${escapeHtml(q.he)}</p>
      <p class="q-en">${escapeHtml(q.en)}</p>
      <h3>במילים פשוטות</h3>
      <p class="q-explain">${escapeHtml(q.explain)}</p>
      <h3>השאילתה</h3>
      <pre class="q-sql"><code>${escapeHtml(q.query)}</code></pre>
      <h3>אפשרויות</h3>
      <ul class="q-options">${opts}</ul>
      <div class="q-answer">✓ תשובה: <strong>${escapeHtml(q.answer)}</strong></div>
    </article>`;
  }).join("");

  return `
    <section class="questions-section" id="questions">
      <h2 class="section-title">שאלות מבחן (20)</h2>
      <p class="section-sub">כל שאלה עם הסבר פשוט, השאילתה והתשובה</p>
      <nav class="q-nav">${nav}</nav>
      ${cards}
    </section>`;
}

function renderTableSection(db, tableName) {
  const schema = getTableSchema(db, tableName);
  const data = getTableRows(db, tableName);
  const count = db.exec(`SELECT COUNT(*) FROM ${tableName}`)[0].values[0][0];

  const schemaRows = schema
    .map(
      (col) =>
        `<tr><td>${escapeHtml(col.name)}</td><td>${escapeHtml(col.type)}</td><td>${col.pk ? "PK" : ""}${col.notnull ? " NOT NULL" : ""}</td></tr>`
    )
    .join("");

  const header = data.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("");
  const body = data.rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");

  return `
    <section class="table-card" id="${tableName}">
      <h2>${tableName} <span class="count">${count} שורות</span></h2>
      <h3>מבנה</h3>
      <table class="schema-table">
        <thead><tr><th>עמודה</th><th>סוג</th><th>מאפיינים</th></tr></thead>
        <tbody>${schemaRows}</tbody>
      </table>
      <h3>נתונים (עד 50 שורות)</h3>
      <div class="scroll"><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></div>
    </section>`;
}

function buildHtml(db) {
  const topNav = `<a href="#questions" class="nav-highlight">שאלות מבחן</a><a href="#erd">ERD</a>${TABLES.map((t) => `<a href="#${t}">${t}</a>`).join("")}`;
  const tableSections = TABLES.map((t) => renderTableSection(db, t)).join("");
  const questionsSection = renderQuestionsSection();
  const mermaid = buildMermaidErd();

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Test_DB – מבחן, טבלאות ו-ERD</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Segoe UI, Tahoma, sans-serif; margin: 0; background: #f4f6f8; color: #1a1a2e; line-height: 1.55; }
    header { background: #1e3a5f; color: #fff; padding: 1.25rem 2rem; }
    header h1 { margin: 0 0 .25rem; font-size: 1.5rem; }
    header p { margin: 0; opacity: .85; }
    main { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
    .erd-card, .table-card, .question-card { background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.08); padding: 1.25rem; margin-bottom: 1.5rem; }
    .erd-card h2, .table-card h2 { margin-top: 0; font-size: 1.2rem; border-bottom: 2px solid #e8ecf0; padding-bottom: .5rem; }
    .count { font-size: .85rem; color: #666; font-weight: normal; }
    nav { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 1.5rem; }
    nav a { background: #fff; padding: .4rem .75rem; border-radius: 6px; text-decoration: none; color: #1e3a5f; font-size: .85rem; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    nav a:hover { background: #1e3a5f; color: #fff; }
    .nav-highlight { background: #2e6ea6 !important; color: #fff !important; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; font-size: .85rem; }
    th, td { border: 1px solid #dde3ea; padding: .45rem .6rem; text-align: right; }
    th { background: #eef2f6; }
    tr:nth-child(even) { background: #fafbfc; }
    .schema-table { max-width: 600px; margin-bottom: 1rem; }
    .scroll { overflow-x: auto; }
    .mermaid { direction: ltr; text-align: center; }
    .erd-image { width: 100%; max-width: 100%; border: 1px solid #dde3ea; border-radius: 8px; margin-bottom: 1.5rem; }
    h3 { font-size: .95rem; color: #444; margin: 1rem 0 .5rem; }
    .section-title { font-size: 1.4rem; margin: 0 0 .25rem; color: #1e3a5f; }
    .section-sub { color: #666; margin: 0 0 1rem; }
    .questions-section { margin-bottom: 2rem; }
    .q-nav { margin-bottom: 1.25rem; }
    .q-nav a { font-size: .8rem; padding: .3rem .55rem; }
    .q-badge { display: inline-block; background: #1e3a5f; color: #fff; font-size: .75rem; padding: .2rem .6rem; border-radius: 4px; margin-bottom: .6rem; }
    .q-he { font-size: 1.05rem; font-weight: 600; margin: 0 0 .35rem; }
    .q-en { font-size: .9rem; color: #555; margin: 0 0 .75rem; direction: ltr; text-align: left; }
    .q-explain { background: #f0f7ff; border-right: 4px solid #2e6ea6; padding: .75rem 1rem; border-radius: 0 8px 8px 0; margin: 0; }
    .q-sql { background: #1e2a3a; color: #e8ecf0; padding: 1rem; border-radius: 8px; overflow-x: auto; direction: ltr; text-align: left; font-size: .8rem; line-height: 1.45; margin: 0; }
    .q-options { margin: .5rem 0; padding-right: 1.25rem; }
    .q-options li { margin: .2rem 0; }
    .q-answer { background: #e8f5e9; border: 1px solid #a5d6a7; color: #2e7d32; padding: .65rem 1rem; border-radius: 8px; margin-top: .75rem; font-size: .95rem; }
  </style>
</head>
<body>
  <header>
    <h1>Test_DB</h1>
    <p>מסד נתונים בנקאי – שאלות מבחן, 11 טבלאות, נתונים ו-ERD</p>
  </header>
  <main>
    <nav>${topNav}</nav>
    ${questionsSection}
    <section class="erd-card" id="erd">
      <h2>ERD – קשרים בין טבלאות (Workbench)</h2>
      <img src="assets/erd-workbench.png" alt="ERD diagram from MySQL Workbench" class="erd-image" />
      <h2>ERD – תרשים מינימלי</h2>
      <pre class="mermaid">${mermaid}</pre>
    </section>
    ${tableSections}
  </main>
  <script>mermaid.initialize({ startOnLoad: true, theme: "neutral" });</script>
</body>
</html>`;
}

async function main() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  const rawSql = fs.readFileSync(sqlPath, "utf8");
  const adapted = adaptMysqlToSqlite(rawSql);
  const statements = splitStatements(adapted);

  for (const stmt of statements) {
    try {
      db.run(stmt);
    } catch (err) {
      if (!stmt.toUpperCase().startsWith("DROP TABLE EMP_TMP")) {
        console.warn("דילוג על statement:", stmt.slice(0, 80), "–", err.message);
      }
    }
  }

  const binary = db.export();
  fs.writeFileSync(dbPath, Buffer.from(binary));
  fs.writeFileSync(htmlPath, buildHtml(db), "utf8");
  db.close();

  console.log("נוצר:", dbPath);
  console.log("נוצר:", htmlPath);
  console.log("טבלאות:", TABLES.join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
