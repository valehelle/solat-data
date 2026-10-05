// Compares jakim-zones.json against the zone list on e-solat.gov.my.
// Exits 1 when JAKIM has added or removed a zone code, so the scheduled
// workflow fails and GitHub sends a notification.
import { readFile } from "node:fs/promises";

const data = JSON.parse(await readFile(new URL("../jakim-zones.json", import.meta.url), "utf8"));
const ours = new Map(data.zones.map((z) => [z.code, z.area]));

const res = await fetch("https://www.e-solat.gov.my/");
if (!res.ok) throw new Error(`e-solat.gov.my returned ${res.status}`);
const html = await res.text();

const jakim = new Map();
for (const m of html.matchAll(/<option value='([A-Z]{3}\d{2})'[^>]*>\s*[A-Z]{3}\d{2}\s*-\s*([^<]*)</g)) {
  jakim.set(m[1], m[2].trim());
}
if (jakim.size < 50) throw new Error(`Only found ${jakim.size} zones on e-solat.gov.my; the page layout may have changed.`);

const added = [...jakim.keys()].filter((c) => !ours.has(c));
const removed = [...ours.keys()].filter((c) => !jakim.has(c));

for (const c of added) console.log(`NEW on JAKIM: ${c} - ${jakim.get(c)}`);
for (const c of removed) console.log(`GONE from JAKIM: ${c} (add it to "renamed" if it was replaced)`);
console.log(`JAKIM: ${jakim.size} zones, ours: ${ours.size} zones.`);

if (added.length || removed.length) process.exit(1);
console.log("Zone codes match.");
