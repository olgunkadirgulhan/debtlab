// Copies data that lives outside web/ into web/lib/generated before every build:
//   shared/links.json          -> links.json   (CTA / affiliate links, same file the videos use)
//   youtube/published.csv      -> videos.json  (latest public Shorts for the home page)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(web, "..");
const out = path.join(web, "lib", "generated");
fs.mkdirSync(out, { recursive: true });

fs.copyFileSync(path.join(root, "shared", "links.json"), path.join(out, "links.json"));

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.filter((r) => r.length === head.length).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

const csv = path.join(root, "youtube", "published.csv");
const videos = fs.existsSync(csv)
  ? parseCsv(fs.readFileSync(csv, "utf8"))
      .filter((r) => r.privacy === "public")
      .reverse()
      .slice(0, 12)
      .map((r) => ({ id: r.video_id, title: r.title, pillar: r.pillar, date: r.date_utc }))
  : [];
fs.writeFileSync(path.join(out, "videos.json"), JSON.stringify(videos, null, 2));
console.log(`sync-shared: links.json, ${videos.length} videos`);
