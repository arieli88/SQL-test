import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mysql = "C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysql.exe";
const sql = process.argv[2];

if (!sql) {
  console.error("Usage: node query.js \"SELECT ...\"");
  process.exit(1);
}

const password = process.env.MYSQL_PASSWORD ?? "";
const args = ["-u", "root", "--default-character-set=utf8mb4", "-D", "Test_DB", "-t", "-e", sql];
if (password) args.splice(2, 0, `-p${password}`);

const child = spawn(mysql, args,
  { stdio: ["ignore", "pipe", "pipe"] }
);

let out = "";
let err = "";
child.stdout.on("data", (d) => (out += d));
child.stderr.on("data", (d) => (err += d));
child.on("close", (code) => {
  if (out) process.stdout.write(out);
  const lines = err.split("\n").filter((l) => !l.includes("Warning"));
  if (lines.join("").trim()) process.stderr.write(lines.join("\n"));
  process.exit(code ?? 0);
});
