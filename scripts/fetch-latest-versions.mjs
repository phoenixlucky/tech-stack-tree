const packageSources = {
  tauri: { type: "crate", name: "tauri" },
  tokio: { type: "crate", name: "tokio" },
  serde: { type: "crate", name: "serde" },
  tracing: { type: "crate", name: "tracing" },
  thiserror: { type: "crate", name: "thiserror" },
  anyhow: { type: "crate", name: "anyhow" },
  "mcp-server": { type: "npm", name: "@modelcontextprotocol/server" },
  "mcp-client": { type: "npm", name: "@modelcontextprotocol/client" },
  zod: { type: "npm", name: "zod" },
  "standard-schema": { type: "npm", name: "@standard-schema/spec" },
  vue: { type: "npm", name: "vue" },
  typescript: { type: "npm", name: "typescript" },
  vite: { type: "npm", name: "vite" },
  pinia: { type: "npm", name: "pinia" },
  "vue-router": { type: "npm", name: "vue-router" },
  tailwindcss: { type: "npm", name: "tailwindcss" },
};

async function readJson(url, headers = {}) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

async function readStableRust() {
  const response = await fetch("https://static.rust-lang.org/dist/channel-rust-stable.toml", {
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Rust stable channel returned HTTP ${response.status}`);
  const manifest = await response.text();
  const start = manifest.indexOf("[pkg.rust]");
  if (start < 0) throw new Error("Rust stable channel has no [pkg.rust] section");
  const end = manifest.indexOf("\n[", start + 1);
  const section = manifest.slice(start, end < 0 ? undefined : end);
  const version = section.match(/^version = "(\d+\.\d+\.\d+)/m)?.[1];
  if (!version) throw new Error("Could not read rustc stable version");
  return version;
}

async function readPackageVersion(source) {
  if (source.type === "crate") {
    const data = await readJson(`https://crates.io/api/v1/crates/${source.name}`, {
      "user-agent": "tech-stack-tree-version-check/1.0 (https://github.com/phoenixlucky/tech-stack-tree)",
    });
    const version = data.crate?.max_stable_version;
    if (!version) throw new Error(`No stable version found for crate ${source.name}`);
    return version;
  }
  const data = await readJson(`https://registry.npmjs.org/${encodeURIComponent(source.name)}`);
  const version = data["dist-tags"]?.latest;
  if (!version) throw new Error(`No latest stable tag found for npm package ${source.name}`);
  return version;
}

const entries = Object.entries(packageSources);
const [rust, packageVersions] = await Promise.all([
  readStableRust(),
  Promise.all(entries.map(async ([key, source]) => [key, await readPackageVersion(source)])),
]);
const versions = Object.fromEntries([["rust", rust], ...packageVersions]);
const snapshot = { checkedAt: new Date().toISOString(), versions };
const { writeFile } = await import("node:fs/promises");
await writeFile(new URL("../latest-versions.json", import.meta.url), `${JSON.stringify(snapshot, null, 2)}\n`);
process.stdout.write(`Recorded ${Object.keys(versions).length} stable versions at ${snapshot.checkedAt}\n`);

